import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { Track } from '@/constants/track';
import ApiManager from '@/services/apiManager';
import { logout } from '@/store/authSlice';

type SyncPayload = {
  positionMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  didJustFinish?: boolean;
};

export const syncPlayback = createAction<SyncPayload>('player/syncPlayback');

let activePlayer: AudioPlayer | null = null;
let statusListener: { remove: () => void } | null = null;

function detachPlayer() {
  if (statusListener) {
    try {
      statusListener.remove();
    } catch {
      /* ignore */
    }
    statusListener = null;
  }
  if (activePlayer) {
    try {
      activePlayer.pause();
      activePlayer.remove();
    } catch {
      /* ignore */
    }
    activePlayer = null;
  }
}

async function unloadSound() {
  detachPlayer();
}

export const playTrackThunk = createAsyncThunk<
  Track,
  Track,
  { rejectValue: string }
>('player/playTrack', async (track, { rejectWithValue, dispatch }) => {
  await unloadSound();
  try {
    const res = await ApiManager.apiRequest<{
      url?: string | null;
      Url?: string | null;
      error?: string;
    }>({
      method: 'GET',
      url: '/Music/stream',
      params: {
        id: track.externalId,
        source: track.source || 'netease',
        br: 128,
      },
    });
    const playUrl = res.url ?? res.Url;
    if (!playUrl?.trim()) {
      return rejectWithValue(
        res.error?.trim() ||
          'No stream URL for this track (try another song or source).'
      );
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'duckOthers',
    });

    const player = createAudioPlayer(playUrl, { updateInterval: 500 });
    activePlayer = player;

    statusListener = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!status.isLoaded) return;
      dispatch(
        syncPlayback({
          positionMillis: Math.round(status.currentTime * 1000),
          durationMillis: Math.round(status.duration * 1000),
          isPlaying: status.playing,
          didJustFinish: status.didJustFinish,
        })
      );
    });

    player.play();
    return track;
  } catch (e: unknown) {
    await unloadSound();
    const msg = e instanceof Error ? e.message : 'Playback failed';
    return rejectWithValue(msg);
  }
});

export const togglePauseThunk = createAsyncThunk('player/togglePause', async (_, { dispatch }) => {
  if (!activePlayer) return;
  if (activePlayer.playing) activePlayer.pause();
  else activePlayer.play();
  const st = activePlayer.currentStatus;
  if (st.isLoaded) {
    dispatch(
      syncPlayback({
        positionMillis: Math.round(st.currentTime * 1000),
        durationMillis: Math.round(st.duration * 1000),
        isPlaying: st.playing,
      })
    );
  }
});

export const stopPlaybackThunk = createAsyncThunk('player/stop', async (_, { dispatch }) => {
  await unloadSound();
  dispatch(clearPlayer());
});

interface PlayerState {
  currentTrack: Track | null;
  phase: 'idle' | 'loading' | 'ready' | 'error';
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  error: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  phase: 'idle',
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    clearPlayer: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncPlayback, (state, action) => {
        state.positionMillis = action.payload.positionMillis;
        state.durationMillis = action.payload.durationMillis;
        state.isPlaying = action.payload.isPlaying;
        if (action.payload.didJustFinish) {
          state.isPlaying = false;
        }
      })
      .addCase(playTrackThunk.pending, (state, action) => {
        state.phase = 'loading';
        state.error = null;
        state.currentTrack = action.meta.arg;
      })
      .addCase(playTrackThunk.fulfilled, (state) => {
        state.phase = 'ready';
        state.error = null;
        state.isPlaying = true;
      })
      .addCase(playTrackThunk.rejected, (state, action) => {
        state.phase = 'error';
        state.error = action.payload ?? action.error.message ?? 'Playback failed';
        state.isPlaying = false;
        void unloadSound();
      })
      .addCase(logout, () => {
        void unloadSound();
        return { ...initialState };
      });
  },
});

export const { clearPlayer } = playerSlice.actions;
export default playerSlice.reducer;

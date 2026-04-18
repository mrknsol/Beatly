import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Playlist, createDefaultPlaylists, LIKED_SONGS_ID } from '@/constants/playlist';
import { logout } from '@/store/authSlice';

const storageKey = (userId: string) => `beatly_playlists_${userId}`;

function ensureLikedSongsFirst(playlists: Playlist[]): Playlist[] {
  const defaultLiked = createDefaultPlaylists()[0];
  const withoutLiked = playlists.filter((p) => p.kind !== 'liked' && p.id !== LIKED_SONGS_ID);
  const existingLiked = playlists.find((p) => p.kind === 'liked' || p.id === LIKED_SONGS_ID);
  const liked: Playlist = existingLiked
    ? {
        ...defaultLiked,
        ...existingLiked,
        id: LIKED_SONGS_ID,
        kind: 'liked',
        title: 'Liked Songs',
      }
    : defaultLiked;
  return [liked, ...withoutLiked];
}

export const hydratePlaylists = createAsyncThunk(
  'playlists/hydrate',
  async (userId: string) => {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    let merged: Playlist[];
    if (!raw) {
      merged = createDefaultPlaylists();
    } else {
      try {
        const parsed = JSON.parse(raw) as Playlist[];
        merged = Array.isArray(parsed) ? ensureLikedSongsFirst(parsed) : createDefaultPlaylists();
      } catch {
        merged = createDefaultPlaylists();
      }
    }
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(merged));
    return merged;
  }
);

interface PlaylistsState {
  items: Playlist[];
  hydratedUserId: string | null;
  loading: boolean;
}

const initialState: PlaylistsState = {
  items: createDefaultPlaylists(),
  hydratedUserId: null,
  loading: false,
};

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setTrackCountForPlaylist: (
      state,
      action: PayloadAction<{ playlistId: string; trackCount: number }>
    ) => {
      const pl = state.items.find((p) => p.id === action.payload.playlistId);
      if (pl) pl.trackCount = Math.max(0, action.payload.trackCount);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydratePlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(hydratePlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hydratedUserId = action.meta.arg;
      })
      .addCase(hydratePlaylists.rejected, (state, action) => {
        state.loading = false;
        state.items = createDefaultPlaylists();
        state.hydratedUserId = action.meta.arg;
      })
      .addCase(logout, (state) => {
        state.items = createDefaultPlaylists();
        state.hydratedUserId = null;
        state.loading = false;
      });
  },
});

export const { setTrackCountForPlaylist } = playlistsSlice.actions;
export default playlistsSlice.reducer;

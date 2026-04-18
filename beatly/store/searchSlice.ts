import { SearchState } from '@/constants/searchState';
import { Track } from '@/constants/track';
import ApiManager from '@/services/apiManager';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

function normalizeTrack(raw: Record<string, unknown>): Track {
  const ext = raw.externalId ?? raw.ExternalId;
  const title = raw.title ?? raw.Title;
  const artist = raw.artist ?? raw.Artist;
  const coverUrl = raw.coverUrl ?? raw.CoverUrl;
  const source = raw.source ?? raw.Source;
  return {
    externalId: String(ext ?? ''),
    title: String(title ?? ''),
    artist: typeof artist === 'string' ? artist : String(artist ?? ''),
    coverUrl: coverUrl ? String(coverUrl) : undefined,
    source: String(source ?? ''),
  };
}

export type SearchArgs = { query: string; source?: string; merge?: boolean };

export const fetchSearch = createAsyncThunk<Track[], SearchArgs>(
  'search/fetchSearch',
  async ({ query, source = 'netease', merge = false }) => {
    const params = merge
      ? { q: query.trim(), merge: true }
      : { q: query.trim(), source };
    const data = await ApiManager.apiRequest<Record<string, unknown>[]>({
      method: 'GET',
      url: '/Music/search',
      params,
    });
    if (!Array.isArray(data)) return [];
    return data.map((row) => normalizeTrack(row));
  }
);

const initialState: SearchState = {
  tracks: [],
  loading: false,
  error: null
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearch.fulfilled, (state, action: PayloadAction<Track[]>) => {
        state.loading = false;
        state.tracks = action.payload;
        state.error = null;
      })
      .addCase(fetchSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
        state.tracks = [];
      });
  },
});

export default searchSlice.reducer;
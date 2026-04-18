import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import searchReducer from './searchSlice';
import playlistsReducer from './playlistsSlice';
import playerReducer from './playerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    playlists: playlistsReducer,
    player: playerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
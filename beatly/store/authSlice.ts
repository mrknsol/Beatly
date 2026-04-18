import { AuthResponse } from '@/constants/AuthResponse';
import { AuthState } from '@/constants/AuthState';
import { User } from '@/constants/User';
import ApiManager from '@/services/apiManager';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export const loginUser = createAsyncThunk<AuthResponse, any>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await ApiManager.apiRequest<AuthResponse>({
        method: 'POST',
        url: '/auth/login',
        data: credentials,
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, any>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await ApiManager.apiRequest<AuthResponse>({
        method: 'POST',
        url: '/auth/register',
        data: userData,
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreToken: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      
        SecureStore.setItemAsync('userToken', action.payload.token);
        SecureStore.setItemAsync('userData', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { restoreToken,logout } = authSlice.actions;
export default authSlice.reducer;
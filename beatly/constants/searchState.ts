import { Track } from "./track";

export interface SearchState {
    tracks: Track[];
    loading: boolean;
    error: string | null;
  }
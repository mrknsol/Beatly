export interface Playlist {
  id: string;
  title: string;
  kind: 'liked' | 'custom';
  trackCount: number;
}

export const LIKED_SONGS_ID = 'liked-songs';

export function createDefaultPlaylists(): Playlist[] {
  return [
    {
      id: LIKED_SONGS_ID,
      title: 'Liked Songs',
      kind: 'liked',
      trackCount: 0,
    },
  ];
}

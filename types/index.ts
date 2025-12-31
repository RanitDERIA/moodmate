export interface Song {
  track_name: string;
  artists: string;
  album_name: string;
  track_genre: string;
  valence: number;
  energy: number;
  emotion_id: number;
}

export interface ApiResponse {
  emotion: string;
  confidence: string | number;
  songs: Song[];
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}
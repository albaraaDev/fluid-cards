import { Word } from './flashcard';

export interface UserData {
  id: string;
  user_id: string;
  data_name: string;
  words: Word[];
  categories: string[];
  metadata: {
    totalWords: number;
    masteredWords: number;
    appVersion: string;
    deviceInfo?: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CloudSyncStatus {
  isConnected: boolean;
  lastSyncAt: number | null;
  hasUnsavedChanges: boolean;
  syncInProgress: boolean;
  error: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}
// src/types/flashcard.ts

export interface Word {
  id: number;
  word: string;
  meaning: string;
  note?: string;
  category: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  lastReviewed: number;
  correctCount: number;
  incorrectCount: number;
  nextReview: number;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  wordsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface AppData {
  words: Word[];
  categories: string[];
  savedAt: number;
  version?: string;
}

export interface ExportData extends AppData {
  exportedAt: string;
  appVersion: string;
  totalWords: number;
  masteredWords: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'newest' | 'oldest' | 'alphabetical' | 'difficulty' | 'nextReview';
export type DifficultyFilter = 'all' | 'سهل' | 'متوسط' | 'صعب';

export interface FilterState {
  search: string;
  category: string;
  difficulty: DifficultyFilter;
  sortBy: SortBy;
}
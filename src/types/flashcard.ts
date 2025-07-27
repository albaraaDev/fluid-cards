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
  
  // SM-2 Algorithm Fields
  easeFactor: number;        // 2.5 افتراضي (1.3 أدنى حد)
  interval: number;          // فترة التكرار بالأيام
  repetition: number;        // عدد التكرارات الناجحة المتتالية
  quality?: number;          // آخر تقييم (0-5)
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  wordCount?: number;         // محسوب ديناميكياً
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  wordsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionType?: 'review' | 'new' | 'mixed';
  averageTime?: number;       // متوسط الوقت لكل كلمة
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
  studySessions?: StudySession[];
}

// UI Types
export type ViewMode = 'grid' | 'list';
export type SortBy = 'newest' | 'oldest' | 'alphabetical' | 'difficulty' | 'nextReview' | 'category';
export type DifficultyFilter = 'all' | 'سهل' | 'متوسط' | 'صعب';

export interface FilterState {
  search: string;
  category: string;
  difficulty: DifficultyFilter;
  sortBy: SortBy;
  showMastered?: boolean;
  showNeedReview?: boolean;
}

// Statistics Types
export interface AppStats {
  totalWords: number;
  masteredWords: number;
  wordsNeedingReview: number;
  progress: number;
  totalReviews?: number;
  averageCorrectRate?: number;
  streak?: {
    current: number;
    longest: number;
  };
  categoryStats?: CategoryStats[];
  difficultyStats?: DifficultyStats[];
}

export interface CategoryStats {
  name: string;
  total: number;
  mastered: number;
  needReview: number;
  progress: number;
}

export interface DifficultyStats {
  name: 'سهل' | 'متوسط' | 'صعب';
  total: number;
  mastered: number;
  progress: number;
  averageReviews?: number;
}

// Navigation Types
export type NavigationTab = 'home' | 'cards' | 'study' | 'stats';

// Study Mode Types (للمراحل القادمة)
export type StudyMode = 
  | 'classic'           // النمط الحالي
  | 'speed'            // محدود بوقت
  | 'reverse'          // من المعنى للكلمة  
  | 'challenge'        // streak counter
  | 'reading'          // قراءة سريعة
  | 'typing'           // كتابة الإجابة
  | 'multiple_choice'; // اختيار متعدد

export interface StudyFilters {
  categories: string[];
  difficulties: DifficultyFilter[];
  needsReview: boolean;
  masteredOnly: boolean;
  hardestFirst: boolean;
  randomOrder: boolean;
}

// Test Types (للمراحل القادمة)
export type TestType = 
  | 'multiple_choice'     // 4 خيارات
  | 'typing'             // كتابة الجواب
  | 'matching'           // مطابقة كلمات/معاني
  | 'true_false'         // صح/خطأ
  | 'mixed';             // خليط من الأنواع

export interface TestQuestion {
  id: string;
  wordId: number;
  type: TestType;
  question: string;
  options?: string[];     // للاختيار المتعدد
  correctAnswer: string;
  userAnswer?: string;
  timeSpent?: number;
  isCorrect?: boolean;
}

export interface Test {
  id: string;
  type: TestType;
  questions: TestQuestion[];
  settings: TestSettings;
  results?: TestResults;
  createdAt: number;
  completedAt?: number;
}

export interface TestSettings {
  timeLimit?: number;       // بالثواني
  questionCount: number;
  categories: string[];
  difficulties: DifficultyFilter[];
  randomOrder: boolean;
  showCorrectAnswer: boolean;
}

export interface TestResults {
  score: number;           // النقاط
  percentage: number;      // النسبة المئوية
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;       // بالثواني
  averageTimePerQuestion: number;
  questionsData: TestQuestion[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Settings Types (للمراحل القادمة)
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  notifications: {
    enabled: boolean;
    reviewReminders: boolean;
    dailyGoals: boolean;
  };
  study: {
    autoFlip: boolean;
    flipDelay: number;
    soundEffects: boolean;
    vibration: boolean;
  };
  sync: {
    enabled: boolean;
    autoBackup: boolean;
    backupInterval: 'daily' | 'weekly' | 'monthly';
  };
}

// API Response Types (للمراحل القادمة)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
}

// Folder Types (للمرحلة القادمة)
export interface Folder {
  id: string;
  name: string;
  color: string;           // #3B82F6
  icon: string;            // 📚 أو lucide-react icon name
  parentId?: string;       // للمجلدات الفرعية
  createdAt: number;
  updatedAt: number;
  wordCount?: number;      // محسوب ديناميكياً
  description?: string;
}

// Hook Types
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => void;
  removeValue: () => void;
}

// Animation Types
export type AnimationType = 
  | 'slide-in-right'
  | 'slide-in-left' 
  | 'slide-in-up'
  | 'slide-in-down'
  | 'fade-in'
  | 'scale-in'
  | 'bounce-in';

// Responsive Types
export type BreakPoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Utility Types
export type Timestamp = number;
export type UUID = string;
export type ColorHex = string;
export type IconName = string;
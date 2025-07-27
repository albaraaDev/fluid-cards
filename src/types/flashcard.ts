// src/types/flashcard.ts

export interface Folder {
  id: string;              // uuid للمجلد
  name: string;            // اسم المجلد
  color: string;           // #3B82F6 - لون المجلد
  icon: string;            // 📚 أو اسم أيقونة lucide
  parentId?: string;       // للمجلدات الفرعية (undefined = مجلد رئيسي)
  createdAt: number;       // تاريخ الإنشاء
  updatedAt: number;       // تاريخ آخر تحديث
  description?: string;    // وصف اختياري للمجلد
  wordCount?: number;      // عدد الكلمات (محسوب ديناميكياً)
  isDefault?: boolean;     // هل هو مجلد افتراضي (غير قابل للحذف)
}

export interface Word {
  id: number;
  word: string;
  meaning: string;
  note?: string;
  folderId: string;        // 🔄 تغيير من category إلى folderId
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  lastReviewed: number;
  correctCount: number;
  incorrectCount: number;
  nextReview: number;
  tags?: string[];         // 🆕 tags إضافية للكلمة
  
  // SM-2 Algorithm Fields
  easeFactor: number;        // 2.5 افتراضي (1.3 أدنى حد)
  interval: number;          // فترة التكرار بالأيام
  repetition: number;        // عدد التكرارات الناجحة المتتالية
  quality?: number;          // آخر تقييم (0-5)
}

// 🆕 UI Types للمجلدات
export type FolderViewMode = 'tree' | 'grid' | 'list';
export type FolderSortBy = 'name' | 'created' | 'wordCount' | 'lastModified' | 'alphabetical';

export interface FolderFilters {
  search: string;
  showEmpty: boolean;       // عرض المجلدات الفارغة
  sortBy: FolderSortBy;
  parentId?: string;        // فلترة حسب المجلد الأب
}

// 🆕 Folder Statistics
export interface FolderStats {
  id: string;
  name: string;
  totalWords: number;
  masteredWords: number;
  needReview: number;
  progress: number;
  color: string;
  icon: string;
  subFolders?: FolderStats[]; // إحصائيات المجلدات الفرعية
}

// تحديث FilterState لتشمل المجلدات
export interface FilterState {
  search: string;
  folderId: string;         // 🔄 تغيير من category إلى folderId
  difficulty: DifficultyFilter;
  sortBy: SortBy;
  showMastered?: boolean;
  showNeedReview?: boolean;
  tags?: string[];          // 🆕 فلترة حسب التاجات
}

// تحديث StudyFilters
export interface StudyFilters {
  folderIds: string[];      // 🔄 تغيير من categories إلى folderIds
  difficulties: DifficultyFilter[];
  needsReview: boolean;
  masteredOnly: boolean;
  hardestFirst: boolean;
  randomOrder: boolean;
  includeSubfolders?: boolean; // 🆕 تضمين المجلدات الفرعية
  tags?: string[];          // 🆕 فلترة حسب التاجات
}

// تحديث AppData للمجلدات
export interface AppData {
  words: Word[];
  folders: Folder[];        // 🔄 تغيير من categories إلى folders
  savedAt: number;
  version?: string;
  
  // 🆕 Migration info (للتوافق مع النسخة القديمة)
  migrationVersion?: number;
  legacyCategories?: string[]; // حفظ مؤقت للتصنيفات القديمة
}

export interface ExportData extends AppData {
  exportedAt: string;
  appVersion: string;
  totalWords: number;
  masteredWords: number;
  totalFolders: number;     // 🆕 عدد المجلدات
  studySessions?: StudySession[];
}

// 🆕 Folder Operations Types
export interface FolderOperation {
  type: 'create' | 'update' | 'delete' | 'move';
  folderId: string;
  timestamp: number;
  data?: any;
}

export interface MoveOperation {
  wordIds: number[];
  fromFolderId: string;
  toFolderId: string;
  timestamp: number;
}

// تحديث Statistics لتشمل المجلدات
export interface AppStats {
  totalWords: number;
  masteredWords: number;
  wordsNeedingReview: number;
  progress: number;
  totalReviews?: number;
  averageCorrectRate?: number;
  totalFolders: number;     // 🆕 عدد المجلدات
  streak?: {
    current: number;
    longest: number;
  };
  folderStats?: FolderStats[];     // 🔄 تغيير من categoryStats
  difficultyStats?: DifficultyStats[];
}

// 🆕 Default Folders Configuration
export interface DefaultFolderConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
}

// Navigation Types - إضافة folders
export type NavigationTab = 'home' | 'cards' | 'study' | 'stats' | 'folders';

// 🆕 Folder Tree Node (للعرض الشجري)
export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  level: number;            // مستوى العمق في الشجرة
  isExpanded?: boolean;     // هل المجلد مفتوح في الشجرة
  path: string[];           // مسار المجلد من الجذر
}

// 🆕 Bulk Operations
export interface BulkOperation {
  action: 'move' | 'delete' | 'addTag' | 'removeTag' | 'updateDifficulty';
  wordIds: number[];
  targetFolderId?: string;
  tag?: string;
  difficulty?: 'سهل' | 'متوسط' | 'صعب';
}

// Error Types - تحديث للمجلدات
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  context?: 'folder' | 'word' | 'study' | 'import' | 'export';
}

// Settings Types - إضافة إعدادات المجلدات
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
  folders: {                // 🆕 إعدادات المجلدات
    defaultViewMode: FolderViewMode;
    showEmptyFolders: boolean;
    autoExpandSubfolders: boolean;
    confirmBeforeDelete: boolean;
    defaultFolderId: string;
  };
  sync: {
    enabled: boolean;
    autoBackup: boolean;
    backupInterval: 'daily' | 'weekly' | 'monthly';
  };
}

// 🔄 تحديث CategoryStats إلى FolderStats (للتوافق)
export interface FolderStatsLegacy {
  name: string;
  total: number;
  mastered: number;
  needReview: number;
  progress: number;
  folderId: string;        // 🆕 إضافة ID المجلد
  color: string;           // 🆕 إضافة اللون
  icon: string;            // 🆕 إضافة الأيقونة
}

// باقي الـ types تبقى كما هي...
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  wordCount?: number;
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  wordsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionType?: 'review' | 'new' | 'mixed';
  averageTime?: number;
  folderId?: string;       // 🆕 ربط الجلسة بمجلد معين
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'newest' | 'oldest' | 'alphabetical' | 'difficulty' | 'nextReview' | 'folder';
export type DifficultyFilter = 'all' | 'سهل' | 'متوسط' | 'صعب';

export interface DifficultyStats {
  name: 'سهل' | 'متوسط' | 'صعب';
  total: number;
  mastered: number;
  progress: number;
  averageReviews?: number;
}

export type StudyMode = 
  | 'classic'           // النمط الحالي
  | 'speed'            // محدود بوقت
  | 'reverse'          // من المعنى للكلمة  
  | 'challenge'        // streak counter
  | 'reading';         // قراءة سريعة

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
  options?: string[];
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
  timeLimit?: number;
  questionCount: number;
  folderIds: string[];     // 🔄 تغيير من categories
  difficulties: DifficultyFilter[];
  randomOrder: boolean;
  showCorrectAnswer: boolean;
  includeSubfolders?: boolean; // 🆕
}

export interface TestResults {
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  questionsData: TestQuestion[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
}
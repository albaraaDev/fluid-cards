// src/data/defaultFolders.ts
// المجلدات الافتراضية مع الحفاظ على روح التطبيق الأصلية

import { DefaultFolderConfig, Folder } from '@/types/flashcard';

export const DEFAULT_FOLDERS_CONFIG: DefaultFolderConfig[] = [
  {
    id: 'general',
    name: 'عام',
    color: '#3B82F6',
    icon: '📚',
    description: 'المجلد الافتراضي للكلمات العامة والمفردات المنوعة',
    isDefault: true,
  },
  {
    id: 'business',
    name: 'أعمال',
    color: '#10B981',
    icon: '💼',
    description: 'مصطلحات الأعمال والتجارة والإدارة',
    isDefault: true,
  },
  {
    id: 'technology',
    name: 'تقنية',
    color: '#8B5CF6',
    icon: '💻',
    description: 'مصطلحات تقنية وبرمجة وتكنولوجيا',
    isDefault: true,
  },
  {
    id: 'nature',
    name: 'طبيعة',
    color: '#059669',
    icon: '🌿',
    description: 'كلمات متعلقة بالطبيعة والبيئة والحيوانات',
    isDefault: true,
  },
  {
    id: 'sports',
    name: 'رياضة',
    color: '#DC2626',
    icon: '⚽',
    description: 'مصطلحات رياضية وألعاب وأنشطة بدنية',
    isDefault: true,
  },
  {
    id: 'academic',
    name: 'أكاديمي',
    color: '#7C3AED',
    icon: '🎓',
    description: 'مصطلحات أكاديمية وتعليمية وعلمية',
    isDefault: true,
  },
];

// دالة إنشاء المجلدات الافتراضية
export const createDefaultFolders = (): Folder[] => {
  const now = Date.now();
  
  return DEFAULT_FOLDERS_CONFIG.map((config) => ({
    id: config.id,
    name: config.name,
    color: config.color,
    icon: config.icon,
    description: config.description,
    isDefault: config.isDefault,
    createdAt: now,
    updatedAt: now,
    wordCount: 0,
  }));
};

// ألوان إضافية للمجلدات المخصصة
export const FOLDER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#DC2626', // Red-600
  '#059669', // Green-600
  '#7C3AED', // Purple-600
  '#BE123C', // Rose-700
];

// أيقونات متاحة للمجلدات (emoji + lucide icons)
export const FOLDER_ICONS = {
  // Emoji Icons
  emoji: [
    '📚', '📖', '📝', '📑', '📊', '📈', '📉', '📋',
    '💼', '💻', '🔬', '🎓', '🌟', '⭐', '🎯', '🔥',
    '🌿', '🌱', '🌳', '🌺', '🌸', '🦋', '🐛', '🐝',
    '⚽', '🏀', '🎾', '🏐', '🏓', '🎱', '🎮', '🎯',
    '🎨', '🎭', '🎪', '🎸', '🎵', '🎶', '🎤', '🎧',
    '🍎', '🍊', '🍌', '🥕', '🥬', '🍕', '🍔', '🍰',
    '🏠', '🏢', '🏫', '🏥', '🏪', '🏭', '🏛️', '🕌',
    '✈️', '🚗', '🚲', '🛸', '🚀', '⛵', '🏝️', '🗺️',
    '❤️', '💙', '💚', '💛', '🧡', '💜', '🤍', '🖤',
  ],
  
  // Lucide Icons (stored as names for later use)
  lucide: [
    'Book', 'BookOpen', 'Library', 'GraduationCap', 'Brain',
    'Briefcase', 'Building', 'Calculator', 'Computer', 'Smartphone',
    'Leaf', 'Tree', 'Flower', 'Sun', 'Moon', 'Star',
    'Target', 'Trophy', 'Award', 'Medal', 'Crown',
    'Heart', 'Smile', 'Coffee', 'Home', 'Globe',
    'Camera', 'Music', 'Headphones', 'Palette', 'Brush',
    'Car', 'Plane', 'Train', 'Ship', 'Rocket',
    'Diamond', 'Gem', 'Lock', 'Key', 'Shield',
  ]
};

// دالة للحصول على لون عشوائي للمجلد الجديد
export const getRandomFolderColor = (): string => {
  return FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
};

// دالة للحصول على أيقونة عشوائية للمجلد الجديد
export const getRandomFolderIcon = (type: 'emoji' | 'lucide' = 'emoji'): string => {
  const icons = FOLDER_ICONS[type];
  return icons[Math.floor(Math.random() * icons.length)];
};

// دالة للتحقق من وجود مجلد افتراضي
export const isDefaultFolder = (folderId: string): boolean => {
  return DEFAULT_FOLDERS_CONFIG.some(config => config.id === folderId);
};

// دالة الحصول على إعدادات المجلد الافتراضي
export const getDefaultFolderConfig = (folderId: string): DefaultFolderConfig | undefined => {
  return DEFAULT_FOLDERS_CONFIG.find(config => config.id === folderId);
};

// دالة ترحيل التصنيفات القديمة إلى مجلدات
export const migrateCategoryToFolder = (categoryName: string): Folder => {
  const now = Date.now();
  
  // البحث في المجلدات الافتراضية أولاً
  const defaultConfig = DEFAULT_FOLDERS_CONFIG.find(
    config => config.name === categoryName
  );
  
  if (defaultConfig) {
    return {
      id: defaultConfig.id,
      name: defaultConfig.name,
      color: defaultConfig.color,
      icon: defaultConfig.icon,
      description: defaultConfig.description,
      isDefault: defaultConfig.isDefault,
      createdAt: now,
      updatedAt: now,
      wordCount: 0,
    };
  }
  
  // إنشاء مجلد جديد للتصنيفات المخصصة
  return {
    id: `migrated_${categoryName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name: categoryName,
    color: getRandomFolderColor(),
    icon: getRandomFolderIcon(),
    description: `مجلد مُرحّل من التصنيف: ${categoryName}`,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    wordCount: 0,
  };
};

// أسماء المجلدات الافتراضية للاستخدام السريع
export const DEFAULT_FOLDER_NAMES = DEFAULT_FOLDERS_CONFIG.map(config => config.name);
export const DEFAULT_FOLDER_IDS = DEFAULT_FOLDERS_CONFIG.map(config => config.id);

// دالة التحقق من صحة بيانات المجلد
export const validateFolderData = (folder: Partial<Folder>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!folder.name || folder.name.trim().length === 0) {
    errors.push('اسم المجلد مطلوب');
  }
  
  if (folder.name && folder.name.trim().length > 50) {
    errors.push('اسم المجلد يجب أن يكون أقل من 50 حرف');
  }
  
  if (!folder.color || !FOLDER_COLORS.includes(folder.color)) {
    errors.push('لون المجلد غير صحيح');
  }
  
  if (!folder.icon || folder.icon.trim().length === 0) {
    errors.push('أيقونة المجلد مطلوبة');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
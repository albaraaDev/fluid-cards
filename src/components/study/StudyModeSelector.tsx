// src/components/study/StudyModeSelector.tsx
'use client';

import { StudyFilters, StudyMode } from '@/types/flashcard';
import React from 'react';
import StudyModeSlider from './StudyModeSlider';

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onModeSelect: (mode: StudyMode) => void;
  onStartStudy: () => void;
  wordsCount: number;
  filteredWords: any[];
  filters: StudyFilters;
  className?: string;
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  onStartStudy,
  wordsCount,
  filteredWords,
  filters,
  className = '',
}) => {
  return (
    <StudyModeSlider
      selectedMode={selectedMode}
      onModeSelect={onModeSelect}
      onStartStudy={onStartStudy}
      wordsCount={wordsCount}
      filteredWords={filteredWords}
      filters={filters}
      className={className}
    />
  );
};

export default StudyModeSelector;
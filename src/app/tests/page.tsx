// تحديث src/app/tests/page.tsx

'use client';

import TestManager from '@/components/tests/TestManager';
import TestResults from '@/components/tests/TestResults';
import TestSetup from '@/components/tests/TestSetup';
import { useApp } from '@/context/AppContext';
import { Test, TestResults as TestResultsType, TestSettings } from '@/types/flashcard';
import {
  AlertCircle,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MoreVertical,
  Play,
  Plus,
  Search,
  Shuffle,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type CurrentView = 'list' | 'setup' | 'active' | 'results';
type TestFilter = 'all' | 'completed' | 'active' | 'draft';
type SortBy = 'newest' | 'oldest' | 'name' | 'score';

export default function TestsPage() {
  
  // ==========================================
  // State Management - استخدام AppContext
  // ==========================================
  const { 
    words, 
    categories, 
    createTest, 
    getTestHistory, 
    submitTestResults, 
    deleteTest,
    saveTestToHistory 
  } = useApp();
  
  const [currentView, setCurrentView] = useState<CurrentView>('list');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [testResults, setTestResults] = useState<TestResultsType | null>(null);
  
  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [testFilter, setTestFilter] = useState<TestFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // الحصول على تاريخ الاختبارات من AppContext
  const tests = getTestHistory();

  // ==========================================
  // Debug logging
  // ==========================================
  useEffect(() => {
    console.log('📋 Tests page loaded. Found tests:', tests.length);
    tests.forEach((test, index) => {
      console.log(`Test ${index + 1}:`, test.name, '- Completed:', !!test.completedAt);
    });
  }, [tests]);

  // ==========================================
  // Test Creation - استخدام AppContext
  // ==========================================
  const handleCreateTest = (settings: TestSettings): Test => {
    console.log('🎯 Creating test with settings:', settings);
    
    try {
      const test = createTest(settings);
      console.log('✅ Test created successfully:', test.id);
      return test;
    } catch (error) {
      console.error('❌ Error creating test:', error);
      throw error;
    }
  };

  const getTestTypeName = (type: string): string => {
    const names = {
      'multiple_choice': 'الاختيار المتعدد',
      'typing': 'الكتابة',
      'matching': 'المطابقة',
      'true_false': 'صح وخطأ',
      'mixed': 'مختلط'
    };
    return names[type as keyof typeof names] || 'عام';
  };

  // ==========================================
  // Quick Tests - تحديث لاستخدام AppContext
  // ==========================================
  const quickTests = [
    {
      id: 'quick_random',
      title: 'اختبار سريع',
      description: '10 أسئلة عشوائية من جميع الكلمات',
      icon: Zap,
      color: 'from-blue-600 to-blue-800',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-600/50',
      action: () => createQuickTest('random')
    },
    {
      id: 'quick_difficult',
      title: 'الكلمات الصعبة',
      description: 'فقط الكلمات التي تحتاج مراجعة',
      icon: Target,
      color: 'from-red-600 to-red-800',
      textColor: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600/50',
      action: () => createQuickTest('difficult')
    },
    {
      id: 'quick_comprehensive',
      title: 'مراجعة شاملة',
      description: '25 سؤال من جميع الفئات والمستويات',
      icon: BookOpen,
      color: 'from-green-600 to-green-800',
      textColor: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600/50',
      action: () => createQuickTest('comprehensive')
    },
    {
      id: 'quick_challenge',
      title: 'تحدي اليوم',
      description: 'اختبار يومي متجدد بصعوبة متدرجة',
      icon: Trophy,
      color: 'from-purple-600 to-purple-800',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-600/50',
      action: () => createQuickTest('challenge')
    }
  ];

  const createQuickTest = (type: string) => {
    console.log('⚡ Creating quick test:', type);
    
    let settings: TestSettings;
    
    switch (type) {
      case 'random':
        settings = {
          type: 'mixed',
          questionCount: 10,
          timeLimit: 300,
          questionTimeLimit: 30,
          categories: [],
          difficulties: ['all'],
          randomOrder: true,
          showCorrectAnswer: true,
          instantFeedback: false,
          allowSkip: true
        };
        break;
        
      case 'difficult':
        settings = {
          type: 'mixed',
          questionCount: Math.min(15, words.length),
          timeLimit: 450,
          questionTimeLimit: 30,
          categories: [],
          difficulties: ['متوسط', 'صعب'],
          randomOrder: true,
          showCorrectAnswer: true,
          instantFeedback: true,
          allowSkip: false
        };
        break;
        
      case 'comprehensive':
        settings = {
          type: 'mixed',
          questionCount: Math.min(25, words.length),
          timeLimit: 900,
          questionTimeLimit: 35,
          categories: [],
          difficulties: ['all'],
          randomOrder: true,
          showCorrectAnswer: true,
          instantFeedback: false,
          allowSkip: true
        };
        break;
        
      case 'challenge':
        settings = {
          type: 'mixed',
          questionCount: 20,
          timeLimit: 600,
          questionTimeLimit: 30,
          categories: [],
          difficulties: ['all'],
          randomOrder: true,
          showCorrectAnswer: false,
          instantFeedback: false,
          allowSkip: false
        };
        break;
        
      default:
        settings = {
          type: 'multiple_choice',
          questionCount: 10,
          timeLimit: 300,
          questionTimeLimit: 30,
          categories: [],
          difficulties: ['all'],
          randomOrder: true,
          showCorrectAnswer: true,
          instantFeedback: false,
          allowSkip: true
        };
    }

    try {
      const test = handleCreateTest(settings);
      test.name = quickTests.find(qt => qt.id === `quick_${type}`)?.title || test.name;
      
      // حفظ الاختبار في التاريخ
      saveTestToHistory(test);
      
      setActiveTest(test);
      setCurrentView('active');
      
      console.log('✅ Quick test created and started');
    } catch (error) {
      console.error('❌ Error creating quick test:', error);
      alert('حدث خطأ أثناء إنشاء الاختبار');
    }
  };

  // ==========================================
  // Event Handlers - تحديث لاستخدام AppContext
  // ==========================================
  const handleStartTest = (settings: TestSettings) => {
    console.log('🚀 Starting custom test');
    
    try {
      const test = handleCreateTest(settings);
      saveTestToHistory(test);
      setActiveTest(test);
      setCurrentView('active');
      
      console.log('✅ Custom test created and started');
    } catch (error) {
      console.error('❌ Error starting test:', error);
      alert('حدث خطأ أثناء إنشاء الاختبار');
    }
  };

  const handleTestComplete = (results: TestResultsType) => {
    console.log('🏁 Test completed with results');
    
    if (activeTest) {
      // حفظ النتائج باستخدام AppContext
      submitTestResults(activeTest.id, results);
      
      setTestResults(results);
      setCurrentView('results');
      
      console.log('✅ Test results saved');
    } else {
      console.error('❌ No active test found when completing');
    }
  };

  const handleRestartTest = () => {
    if (activeTest) {
      console.log('🔄 Restarting test');
      
      // إنشاء نسخة جديدة من الاختبار
      const resetTest = handleCreateTest(activeTest.settings);
      resetTest.name = activeTest.name;
      
      saveTestToHistory(resetTest);
      setActiveTest(resetTest);
      setTestResults(null);
      setCurrentView('active');
      
      console.log('✅ Test restarted');
    }
  };

  const handleBackToTests = () => {
    console.log('🏠 Returning to tests list');
    setActiveTest(null);
    setTestResults(null);
    setCurrentView('list');
  };

  const handleDeleteTest = (testId: string) => {
    console.log('🗑️ Deleting test:', testId);
    deleteTest(testId);
  };

  // ==========================================
  // Filtered and Sorted Tests - تحديث للعمل مع البيانات الجديدة
  // ==========================================
  const filteredAndSortedTests = useMemo(() => {
    let filtered = [...tests];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (testFilter) {
      case 'completed':
        filtered = filtered.filter(test => test.completedAt);
        break;
      case 'active':
        filtered = filtered.filter(test => test.isActive);
        break;
      case 'draft':
        filtered = filtered.filter(test => !test.completedAt && !test.isActive);
        break;
    }

    // Sort tests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          const scoreA = a.results?.percentage || 0;
          const scoreB = b.results?.percentage || 0;
          return scoreB - scoreA;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [tests, searchQuery, testFilter, sortBy]);

  // ==========================================
  // Render Views - (نفس الكود السابق بدون تغيير)
  // ==========================================

  // 7.2 عرض قائمة الاختبارات
  const renderTestsList = () => (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="text-center mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">مركز الاختبارات</h1>
        <p className="text-xl text-gray-400">اختبر معرفتك وتتبع تقدمك مع أنواع مختلفة من الاختبارات</p>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-sm text-gray-400">
            Debug: {tests.length} tests in history
          </div>
        )}
      </div>

      {/* Quick Tests Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">اختبارات سريعة</h2>
          <div className="text-sm text-gray-400">ابدأ فوراً</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {quickTests.map((quickTest) => {
            const Icon = quickTest.icon;
            
            return (
              <button
                key={quickTest.id}
                onClick={quickTest.action}
                className={`
                  ${quickTest.bgColor} rounded-2xl lg:rounded-3xl p-6 lg:p-8 border ${quickTest.borderColor}
                  hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-right
                  hover:shadow-xl touch-manipulation
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={quickTest.textColor} size={32} />
                  <div className="text-2xl">⚡</div>
                </div>
                
                <h3 className="text-white font-bold text-lg lg:text-xl mb-2">
                  {quickTest.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {quickTest.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Test Creation */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl lg:rounded-3xl p-8 lg:p-12 border border-gray-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Plus size={32} className="text-white" />
          </div>
          
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            إنشاء اختبار مخصص
          </h3>
          
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            صمم اختبارك الخاص باختيار نوع الأسئلة، مستوى الصعوبة، والفئات التي تريد التركيز عليها
          </p>
          
          <button
            onClick={() => setCurrentView('setup')}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus size={24} />
            <span>إنشاء اختبار جديد</span>
          </button>
        </div>
      </div>

      {/* Test History */}
      {tests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">تاريخ الاختبارات ({tests.length})</h2>
            
            {/* Search and Filters */}
            <div className="flex items-center space-x-3">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="بحث في الاختبارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all ${
                  showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Status Filter */}
                <div>
                  <label className="text-white font-semibold mb-3 block">الحالة:</label>
                  <div className="flex space-x-2">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'completed', label: 'مكتملة' },
                      { id: 'active', label: 'نشطة' },
                      { id: 'draft', label: 'مسودات' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setTestFilter(filter.id as TestFilter)}
                        className={`px-4 py-2 rounded-xl transition-all ${
                          testFilter === filter.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-white font-semibold mb-3 block">ترتيب حسب:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 w-full"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="oldest">الأقدم</option>
                    <option value="name">الاسم</option>
                    <option value="score">النتيجة</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tests Grid */}
          {filteredAndSortedTests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedTests.map((test) => {
                const isCompleted = !!test.completedAt;
                const score = test.results?.percentage || 0;
                
                return (
                  <div
                    key={test.id}
                    className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-[1.02]"
                  >
                    
                    {/* Test Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={20} className="text-white" /> : <Clock size={20} className="text-white" />}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{test.name}</h3>
                          <p className="text-gray-400 text-sm">{test.questions.length} أسئلة</p>
                        </div>
                      </div>
                      
                      <button className="p-2 text-gray-400 hover:text-white transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                    {/* Test Stats */}
                    {isCompleted && test.results && (
                      <div className="bg-gray-700/30 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className={`text-2xl font-bold ${
                              score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {Math.round(score)}%
                            </div>
                            <div className="text-gray-400 text-xs">النتيجة</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">{test.results.correctAnswers}</div>
                            <div className="text-gray-400 text-xs">صحيحة</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-400">
                              {Math.floor(test.results.timeSpent / 60)}:{String(test.results.timeSpent % 60).padStart(2, '0')}
                            </div>
                            <div className="text-gray-400 text-xs">الوقت</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Test Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">النوع:</span>
                        <span className="text-white">{getTestTypeName(test.settings.type)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">التاريخ:</span>
                        <span className="text-white">{new Date(test.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {isCompleted ? (
                        <button
                          onClick={() => {
                            setTestResults(test.results!);
                            setActiveTest(test);
                            setCurrentView('results');
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                        >
                          <Eye size={16} />
                          <span>عرض النتائج</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveTest(test);
                            setCurrentView('active');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                        >
                          <Play size={16} />
                          <span>متابعة</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد اختبارات</h3>
              <p className="text-gray-500">ابدأ بإنشاء اختبارك الأول أو جرب الاختبارات السريعة</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State for New Users */}
      {tests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Brain size={48} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">مرحباً بك في مركز الاختبارات!</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            هنا يمكنك اختبار معرفتك بطرق مختلفة ومتنوعة. ابدأ بأحد الاختبارات السريعة أو أنشئ اختباراً مخصصاً حسب احتياجاتك.
          </p>
        </div>
      )}
    </div>
  );

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Check if user has words */}
      {words.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookOpen size={48} className="text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">لا توجد كلمات للاختبار</h2>
          <p className="text-gray-400 text-xl mb-8">أضف بعض الكلمات أولاً لتتمكن من إنشاء الاختبارات</p>
          <button
            onClick={() => window.location.href = '/cards'}
            className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
          >
            <Plus size={24} />
            <span>إضافة كلمات</span>
          </button>
        </div>
      ) : (
        <>
          {/* Render Current View */}
          {currentView === 'list' && renderTestsList()}
          
          {currentView === 'setup' && (
            <TestSetup
              onStartTest={handleStartTest}
              onCancel={() => setCurrentView('list')}
              availableWords={words}
              categories={categories}
            />
          )}
          
          {currentView === 'active' && activeTest && (
            <TestManager
              test={activeTest}
              onComplete={handleTestComplete}
              onExit={handleBackToTests}
            />
          )}
          
          {currentView === 'results' && testResults && activeTest && (
            <TestResults
              results={testResults}
              test={activeTest}
              onRestart={handleRestartTest}
              onReviewAnswers={() => setCurrentView('results')}
              onBackToTests={handleBackToTests}
            />
          )}
        </>
      )}
    </div>
  );
}
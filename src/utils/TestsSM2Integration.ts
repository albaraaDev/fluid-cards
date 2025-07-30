// src/utils/TestsSM2Integration.ts

import { Test, TestQuestion, Word } from '@/types/flashcard';

/**
 * كلاس لربط نتائج الاختبارات مع نظام SM-2 للمراجعة المتباعدة
 */
export class TestsSM2Integration {
  
  /**
   * تحديث تقدم الكلمات بناءً على نتائج الاختبار
   * مع مراعاة نوع السؤال ووقت الإجابة والصعوبة
   */
  static updateWordsFromTestResults(
    test: Test, 
    words: Word[], 
    updateProgressFunction: (wordId: number, quality: number) => void
  ): void {
    
    test.questions.forEach(question => {
      const word = words.find(w => w.id === question.wordId);
      if (!word || question.isCorrect === undefined) return;
      
      // حساب جودة الإجابة (0-5) بناءً على عدة عوامل
      const quality = this.calculateAnswerQuality(question, test);
      
      // تطبيق التحديث
      updateProgressFunction(word.id, quality);
      
      // تحديث إضافي للكلمات الصعبة
      if (quality <= 2 && word.difficulty === 'صعب') {
        // إعطاء فرصة إضافية للمراجعة السريعة
        word.nextReview = Date.now() + (24 * 60 * 60 * 1000); // 24 ساعة
      }
    });
  }
  
  /**
   * حساب جودة الإجابة بناءً على عدة عوامل
   */
  private static calculateAnswerQuality(question: TestQuestion, test: Test): number {
    if (question.isCorrect === undefined) return 2;
    
    let baseQuality = question.isCorrect ? 4 : 2;
    
    // تعديل حسب وقت الإجابة
    const timeSpent = question.timeSpent || 30;
    const expectedTime = test.settings.questionTimeLimit || 30;
    const timeRatio = timeSpent / expectedTime;
    
    if (question.isCorrect) {
      // مكافأة للإجابات السريعة الصحيحة
      if (timeRatio <= 0.3) baseQuality = 5;        // ممتاز - إجابة سريعة جداً
      else if (timeRatio <= 0.5) baseQuality = 4;   // جيد جداً - إجابة سريعة
      else if (timeRatio <= 0.8) baseQuality = 4;   // جيد - في الوقت المناسب
      else baseQuality = 3;                         // مقبول - إجابة بطيئة
    } else {
      // تحليل الإجابات الخاطئة
      if (timeRatio <= 0.2) baseQuality = 1;        // خطأ سريع - ربما تخمين
      else if (timeRatio >= 0.8) baseQuality = 2;   // خطأ بطيء - عدم معرفة
      else baseQuality = 2;                         // خطأ عادي
    }
    
    // تعديل حسب نوع السؤال
    baseQuality = this.adjustQualityByQuestionType(baseQuality, question);
    
    // تعديل حسب صعوبة السؤال
    baseQuality = this.adjustQualityByDifficulty(baseQuality, question);
    
    // التأكد من أن القيمة في النطاق المطلوب (0-5)
    return Math.max(0, Math.min(5, baseQuality));
  }
  
  /**
   * تعديل الجودة حسب نوع السؤال
   */
  private static adjustQualityByQuestionType(quality: number, question: TestQuestion): number {
    switch (question.type) {
      case 'multiple_choice':
        // اختيار متعدد أسهل - تقليل المكافأة قليلاً
        return question.isCorrect ? Math.max(3, quality - 0.5) : quality;
        
      case 'typing':
        // الكتابة أصعب - زيادة المكافأة
        return question.isCorrect ? Math.min(5, quality + 0.5) : quality;
        
      case 'matching':
        // المطابقة متوسطة الصعوبة
        return quality;
        
      case 'true_false':
        // صح/خطأ أسهل - تقليل المكافأة
        return question.isCorrect ? Math.max(3, quality - 0.3) : quality;
        
      default:
        return quality;
    }
  }
  
  /**
   * تعديل الجودة حسب صعوبة السؤال
   */
  private static adjustQualityByDifficulty(quality: number, question: TestQuestion): number {
    const difficulty = question.difficulty || 3;
    
    if (difficulty >= 4) {
      // سؤال صعب - مكافأة إضافية للإجابة الصحيحة
      return question.isCorrect ? Math.min(5, quality + 0.5) : Math.max(1, quality - 0.5);
    } else if (difficulty <= 2) {
      // سؤال سهل - تقليل المكافأة
      return question.isCorrect ? Math.max(3, quality - 0.3) : quality;
    }
    
    return quality;
  }
  
  /**
   * تحديد الكلمات التي تحتاج مراجعة عاجلة بناءً على أداء الاختبارات
   */
  static getUrgentReviewWords(tests: Test[], words: Word[]): Word[] {
    const wordPerformance = new Map<number, { correct: number; total: number; lastFailed: number }>();
    
    // تحليل أداء كل كلمة في الاختبارات
    tests.forEach(test => {
      if (!test.completedAt) return;
      
      test.questions.forEach(question => {
        if (question.isCorrect === undefined) return;
        
        const current = wordPerformance.get(question.wordId) || { correct: 0, total: 0, lastFailed: 0 };
        current.total += 1;
        
        if (question.isCorrect) {
          current.correct += 1;
        } else {
          current.lastFailed = test.completedAt!;
        }
        
        wordPerformance.set(question.wordId, current);
      });
    });
    
    // تحديد الكلمات التي تحتاج مراجعة عاجلة
    const urgentWords: Word[] = [];
    
    words.forEach(word => {
      const performance = wordPerformance.get(word.id);
      if (!performance) return;
      
      const successRate = performance.correct / performance.total;
      const daysSinceLastFail = (Date.now() - performance.lastFailed) / (24 * 60 * 60 * 1000);
      
      // معايير المراجعة العاجلة
      const needsUrgentReview = (
        successRate < 0.6 ||                          // معدل نجاح أقل من 60%
        (successRate < 0.8 && daysSinceLastFail < 7)  // معدل نجاح أقل من 80% وفشل خلال أسبوع
      );
      
      if (needsUrgentReview) {
        urgentWords.push(word);
      }
    });
    
    return urgentWords.sort((a, b) => {
      const perfA = wordPerformance.get(a.id)!;
      const perfB = wordPerformance.get(b.id)!;
      return (perfA.correct / perfA.total) - (perfB.correct / perfB.total);
    });
  }
  
  /**
   * اقتراح نوع الاختبار المناسب للمستخدم بناءً على أدائه
   */
  static suggestTestType(tests: Test[]): {
    suggested: string;
    reason: string;
    settings: Partial<any>;
  } {
    if (tests.length === 0) {
      return {
        suggested: 'mixed',
        reason: 'اختبار مختلط للتعرف على نقاط القوة والضعف',
        settings: {
          questionCount: 10,
          timeLimit: 300,
          showCorrectAnswer: true,
          instantFeedback: true
        }
      };
    }
    
    // تحليل الأداء في الاختبارات السابقة
    const recentTests = tests.slice(0, 5);
    const typePerformance = new Map<string, { correct: number; total: number }>();
    
    recentTests.forEach(test => {
      if (!test.results) return;
      
      test.questions.forEach(question => {
        const current = typePerformance.get(question.type) || { correct: 0, total: 0 };
        current.total += 1;
        if (question.isCorrect) current.correct += 1;
        typePerformance.set(question.type, current);
      });
    });
    
    // تحديد النوع الأضعف
    let weakestType = '';
    let lowestRate = 1;
    
    typePerformance.forEach((performance, type) => {
      const rate = performance.correct / performance.total;
      if (rate < lowestRate) {
        lowestRate = rate;
        weakestType = type;
      }
    });
    
    if (lowestRate < 0.7 && weakestType) {
      const typeNames = {
        'multiple_choice': 'الاختيار المتعدد',
        'typing': 'الكتابة',
        'matching': 'المطابقة',
        'true_false': 'صح وخطأ'
      };
      
      return {
        suggested: weakestType,
        reason: `تحسين الأداء في أسئلة ${typeNames[weakestType as keyof typeof typeNames]}`,
        settings: {
          questionCount: 15,
          timeLimit: 450,
          showCorrectAnswer: true,
          instantFeedback: true
        }
      };
    }
    
    return {
      suggested: 'mixed',
      reason: 'أداء متوازن - مواصلة التحدي المتنوع',
      settings: {
        questionCount: 20,
        timeLimit: 600,
        showCorrectAnswer: false,
        instantFeedback: false
      }
    };
  }
  
  /**
   * حساب مستوى الصعوبة المناسب للمستخدم
   */
  static calculateOptimalDifficulty(tests: Test[], words: Word[]): {
    suggested: string[];
    reason: string;
  } {
    if (tests.length === 0) {
      return {
        suggested: ['سهل', 'متوسط'],
        reason: 'البدء بمستوى متدرج للتعلم الفعال'
      };
    }
    
    const recentAverage = tests.slice(0, 3).reduce((sum, test) => {
      return sum + (test.results?.percentage || 0);
    }, 0) / Math.min(3, tests.length);
    
    if (recentAverage >= 85) {
      return {
        suggested: ['متوسط', 'صعب'],
        reason: 'أداء ممتاز - جاهز للتحدي الأصعب'
      };
    } else if (recentAverage >= 70) {
      return {
        suggested: ['سهل', 'متوسط', 'صعب'],
        reason: 'أداء جيد - مزيج متوازن من المستويات'
      };
    } else {
      return {
        suggested: ['سهل', 'متوسط'],
        reason: 'التركيز على تقوية الأساسيات'
      };
    }
  }
}
// src/utils/QuestionGenerator.ts

import { DifficultyFilter, TestQuestion, TestType, Word } from '@/types/flashcard';

export class QuestionGenerator {
  
  // ==========================================
  // 2.1.1 دالة إنشاء سؤال متعدد الخيارات
  // ==========================================
  static generateMultipleChoice(word: Word, allWords: Word[]): TestQuestion {
    // اختيار إما الكلمة -> المعنى أو المعنى -> الكلمة عشوائياً
    const isWordToMeaning = Math.random() > 0.5;
    
    const question = isWordToMeaning 
      ? `ما معنى كلمة "${word.word}"؟`
      : `ما الكلمة التي تعني "${word.meaning}"؟`;
    
    const correctAnswer = isWordToMeaning ? word.meaning : word.word;
    
    // الحصول على 3 إجابات خاطئة من نفس الفئة أو الصعوبة
    const wrongAnswers = this.getRandomWrongAnswers(
      word, 
      allWords, 
      3, 
      isWordToMeaning ? 'meaning' : 'word'
    );
    
    // خلط الخيارات
    const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: `mcq_${word.id}_${Date.now()}`,
      wordId: word.id,
      type: 'multiple_choice',
      question,
      correctAnswer,
      options,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // ==========================================
  // 2.1.2 دالة إنشاء سؤال كتابة
  // ==========================================
  static generateTypingQuestion(word: Word): TestQuestion {
    // اختيار الاتجاه عشوائياً
    const isWordToMeaning = Math.random() > 0.5;
    
    const question = isWordToMeaning
      ? `اكتب معنى كلمة "${word.word}"`
      : `اكتب الكلمة التي تعني "${word.meaning}"`;
    
    const correctAnswer = isWordToMeaning ? word.meaning : word.word;
    
    return {
      id: `typing_${word.id}_${Date.now()}`,
      wordId: word.id,
      type: 'typing',
      question,
      correctAnswer,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // ==========================================
  // 2.1.3 دالة إنشاء سؤال مطابقة
  // ==========================================
  static generateMatchingQuestion(words: Word[]): TestQuestion {
    // أخذ 4-6 كلمات للمطابقة
    const selectedWords = words.slice(0, Math.min(6, words.length));
    
    // إنشاء قوائم الكلمات والمعاني
    const wordsList = selectedWords.map(w => w.word);
    const meaningsList = selectedWords.map(w => w.meaning);
    
    // خلط المعاني فقط لجعل المطابقة غير مرتبة
    const shuffledMeanings = this.shuffleArray([...meaningsList]);
    
    // إنشاء السؤال كـ JSON string لحفظ البيانات
    const questionData = {
      words: wordsList,
      meanings: shuffledMeanings,
    };
    
    // الإجابة الصحيحة: مصفوفة من أزواج الكلمة-المعنى
    const correctMatches = selectedWords.reduce((acc, word) => {
      acc[word.word] = word.meaning;
      return acc;
    }, {} as Record<string, string>);
    
    return {
      id: `matching_${Date.now()}`,
      wordId: selectedWords[0].id, // استخدام أول كلمة كمرجع
      type: 'matching',
      question: JSON.stringify(questionData),
      correctAnswer: JSON.stringify(correctMatches),
      difficulty: Math.round(
        selectedWords.reduce((sum, w) => sum + this.getDifficultyNumber(w.difficulty), 0) / selectedWords.length
      ),
    };
  }

  // ==========================================
  // 2.1.4 دالة إنشاء سؤال صح/خطأ
  // ==========================================
  static generateTrueFalseQuestion(word: Word, allWords: Word[]): TestQuestion {
    // 50% احتمال أن يكون السؤال صحيح أو خاطئ
    const isCorrect = Math.random() > 0.5;
    
    let statement: string;
    let correctAnswer: string;
    
    if (isCorrect) {
      // إنشاء جملة صحيحة
      statement = `كلمة "${word.word}" تعني "${word.meaning}"`;
      correctAnswer = 'true';
    } else {
      // إنشاء جملة خاطئة بربط الكلمة مع معنى كلمة أخرى
      const wrongMeaning = this.generateFalseStatement(word, allWords);
      statement = `كلمة "${word.word}" تعني "${wrongMeaning}"`;
      correctAnswer = 'false';
    }
    
    return {
      id: `tf_${word.id}_${Date.now()}`,
      wordId: word.id,
      type: 'true_false',
      question: statement,
      correctAnswer,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // ==========================================
  // 2.1.5 دالة اختيار كلمات عشوائية للخيارات الخاطئة
  // ==========================================
  private static getRandomWrongAnswers(
    correctWord: Word, 
    allWords: Word[], 
    count: number,
    answerType: 'word' | 'meaning' = 'meaning'
  ): string[] {
    // فلترة الكلمات (إزالة الكلمة الصحيحة)
    const availableWords = allWords.filter(w => w.id !== correctWord.id);
    
    // تفضيل كلمات من نفس الفئة أو الصعوبة
    const sameCategory = availableWords.filter(w => w.category === correctWord.category);
    const sameDifficulty = availableWords.filter(w => w.difficulty === correctWord.difficulty);
    
    // إنشاء pool للاختيار منه
    let candidatePool: Word[] = [];
    
    // أولوية للفئة نفسها
    if (sameCategory.length >= count) {
      candidatePool = sameCategory;
    } else if (sameDifficulty.length >= count) {
      candidatePool = sameDifficulty;
    } else {
      candidatePool = availableWords;
    }
    
    // خلط وأخذ العدد المطلوب
    const shuffled = this.shuffleArray([...candidatePool]);
    const selectedWords = shuffled.slice(0, count);
    
    // استخراج النص المطلوب (كلمة أو معنى)
    return selectedWords.map(w => answerType === 'word' ? w.word : w.meaning);
  }

  // ==========================================
  // 2.1.6 دالة خلط الخيارات
  // ==========================================
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ==========================================
  // 2.1.7 دالة إنشاء جملة صح/خطأ مضللة
  // ==========================================
  private static generateFalseStatement(word: Word, allWords: Word[]): string {
    // الحصول على كلمات من نفس الفئة لجعل الخطأ أصعب
    const sameCategory = allWords.filter(w => 
      w.id !== word.id && w.category === word.category
    );
    
    // إذا لم تتوفر كلمات من نفس الفئة، استخدم أي كلمة
    const candidateWords = sameCategory.length > 0 ? sameCategory : 
      allWords.filter(w => w.id !== word.id);
    
    if (candidateWords.length === 0) {
      return 'معنى غير صحيح';
    }
    
    // اختيار معنى عشوائي
    const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    return randomWord.meaning;
  }

  // ==========================================
  // 2.1.8 دوال مساعدة
  // ==========================================
  
  // تحويل الصعوبة من نص إلى رقم
  private static getDifficultyNumber(difficulty: string): number {
    switch (difficulty) {
      case 'سهل': return 1;
      case 'متوسط': return 3;
      case 'صعب': return 5;
      default: return 3;
    }
  }
  
  // فلترة الكلمات حسب المعايير
  static filterWordsForTest(
    words: Word[], 
    categories: string[], 
    difficulties: DifficultyFilter[]
  ): Word[] {
    return words.filter(word => {
      // فلتر الفئات
      const categoryMatch = categories.length === 0 || categories.includes(word.category);
      
      // فلتر الصعوبة
      const difficultyMatch = difficulties.length === 0 || 
        difficulties.includes('all') || 
        difficulties.includes(word.difficulty as DifficultyFilter);
      
      return categoryMatch && difficultyMatch;
    });
  }
  
  // ترتيب الكلمات حسب الصعوبة
  static sortWordsByDifficulty(words: Word[], hardestFirst: boolean = false): Word[] {
    const difficultyOrder = { 'سهل': 1, 'متوسط': 2, 'صعب': 3 };
    
    return [...words].sort((a, b) => {
      const orderA = difficultyOrder[a.difficulty];
      const orderB = difficultyOrder[b.difficulty];
      
      return hardestFirst ? orderB - orderA : orderA - orderB;
    });
  }
  
  // إنشاء أسئلة مختلطة
  static generateMixedQuestions(
    words: Word[], 
    questionCount: number, 
    typeDistribution?: Partial<Record<TestType, number>>
  ): TestQuestion[] {
    const questions: TestQuestion[] = [];
    const availableTypes: TestType[] = ['multiple_choice', 'typing', 'true_false'];
    
    // إضافة مطابقة إذا كان لدينا كلمات كافية
    if (words.length >= 4) {
      availableTypes.push('matching');
    }
    
    const shuffledWords = this.shuffleArray([...words]);
    
    for (let i = 0; i < questionCount && i < shuffledWords.length; i++) {
      const word = shuffledWords[i];
      
      // اختيار نوع السؤال عشوائياً أو حسب التوزيع المحدد
      let questionType: TestType;
      
      if (typeDistribution) {
        // اختيار حسب التوزيع المحدد (يمكن تطويره لاحقاً)
        questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } else {
        questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      }
      
      // إنشاء السؤال حسب النوع
      let question: TestQuestion;
      
      switch (questionType) {
        case 'multiple_choice':
          question = this.generateMultipleChoice(word, words);
          break;
        case 'typing':
          question = this.generateTypingQuestion(word);
          break;
        case 'true_false':
          question = this.generateTrueFalseQuestion(word, words);
          break;
        case 'matching':
          // للمطابقة، أخذ مجموعة من الكلمات
          const matchingWords = shuffledWords.slice(i, i + 4);
          question = this.generateMatchingQuestion(matchingWords);
          i += 3; // تخطي الكلمات المستخدمة في المطابقة
          break;
        default:
          question = this.generateMultipleChoice(word, words);
      }
      
      questions.push(question);
    }
    
    return questions;
  }
  
  // التحقق من صحة الإجابة للكتابة (مع تساهل في التنسيق)
  static validateTypingAnswer(userAnswer: string, correctAnswer: string): boolean {
    // تطبيع النصوص
    const normalize = (text: string) => 
      text.trim()
          .toLowerCase()
          .replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, '') // إزالة علامات الترقيم
          .replace(/\s+/g, ' '); // توحيد المسافات
    
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    // تطابق تام
    if (normalizedUser === normalizedCorrect) {
      return true;
    }
    
    // تطابق جزئي للإجابات الطويلة (85% تشابه)
    if (normalizedCorrect.length > 10) {
      const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
      return similarity >= 0.85;
    }
    
    return false;
  }
  
  // حساب نسبة التشابه بين نصين
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  // حساب Levenshtein Distance
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
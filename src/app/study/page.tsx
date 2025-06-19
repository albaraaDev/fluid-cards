'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { useCards } from '@/hooks/useCards'
import { useCollections } from '@/hooks/useCollections'
import { Card, Collection, StudyMode } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Bookmark,
  BookmarkCheck,
  Check,
  Pause,
  Play,
  Progress,
  RotateCcw,
  SkipForward,
  Target,
  Timer,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StudySession {
  startTime: Date
  totalCards: number
  currentIndex: number
  correctAnswers: number
  wrongAnswers: number
  skippedCards: number
  timeSpent: number
  mode: StudyMode
}

function StudyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('collection')
  const studyMode = (searchParams.get('mode') as StudyMode) || 'normal'
  
  const [cards, setCards] = useState<Card[]>([])
  const [collection, setCollection] = useState<Collection | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const { getStudyCards, toggleBookmark } = useCards()
  const { getCollection } = useCollections()

  // تحميل البيانات
  useEffect(() => {
    const loadStudyData = async () => {
      if (!collectionId) {
        router.push('/')
        return
      }

      setIsLoading(true)

      // جلب المجموعة
      const { data: collectionData } = await getCollection(collectionId)
      if (!collectionData) {
        router.push('/')
        return
      }
      setCollection(collectionData)

      // جلب البطاقات
      const { data: studyCards } = await getStudyCards(collectionId, studyMode)
      if (studyCards.length === 0) {
        router.push(`/collections/${collectionId}`)
        return
      }

      setCards(studyCards)
      
      // إنشاء جلسة دراسة جديدة
      const session: StudySession = {
        startTime: new Date(),
        totalCards: studyCards.length,
        currentIndex: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        skippedCards: 0,
        timeSpent: 0,
        mode: studyMode
      }
      setStudySession(session)
      setIsLoading(false)
    }

    loadStudyData()
  }, [collectionId, studyMode, getCollection, getStudyCards, router])

  // مؤقت الدراسة
  useEffect(() => {
    if (!isPaused && !showResults && studySession) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPaused, showResults, studySession])

  const currentCard = cards[currentCardIndex]

  const handleAnswer = (isCorrect: boolean) => {
    if (!studySession) return

    const updatedSession = {
      ...studySession,
      correctAnswers: isCorrect ? studySession.correctAnswers + 1 : studySession.correctAnswers,
      wrongAnswers: !isCorrect ? studySession.wrongAnswers + 1 : studySession.wrongAnswers,
      timeSpent: timeElapsed
    }

    setStudySession(updatedSession)
    nextCard()
  }

  const handleSkip = () => {
    if (!studySession) return

    const updatedSession = {
      ...studySession,
      skippedCards: studySession.skippedCards + 1,
      timeSpent: timeElapsed
    }

    setStudySession(updatedSession)
    nextCard()
  }

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      // انتهاء الجلسة
      finishSession()
    }
  }

  const finishSession = () => {
    if (studySession) {
      const finalSession = {
        ...studySession,
        timeSpent: timeElapsed
      }
      setStudySession(finalSession)
    }
    setShowResults(true)
  }

  const handleBookmark = async () => {
    if (currentCard) {
      await toggleBookmark(currentCard.id)
      // تحديث البطاقة الحالية
      setCards(prev => 
        prev.map(card => 
          card.id === currentCard.id 
            ? { ...card, is_bookmarked: !card.is_bookmarked }
            : card
        )
      )
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!studySession) return 0
    return Math.round(((currentCardIndex + 1) / studySession.totalCards) * 100)
  }

  const getAccuracyPercentage = () => {
    if (!studySession) return 0
    const totalAnswered = studySession.correctAnswers + studySession.wrongAnswers
    if (totalAnswered === 0) return 0
    return Math.round((studySession.correctAnswers / totalAnswered) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-8 rounded-3xl text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto glass rounded-full flex items-center justify-center"
            >
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            جاري تحضير الجلسة...
          </h2>
          <p className="text-white/70">
            نقوم بتجهيز البطاقات للمراجعة
          </p>
        </motion.div>
      </div>
    )
  }

  if (showResults && studySession) {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 glass-strong rounded-3xl flex items-center justify-center">
              <Award className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gradient mb-2">
              رائع! أكملت المراجعة
            </h1>
            <p className="text-white/70">
              إليك ملخص أدائك في هذه الجلسة
            </p>
          </motion.div>

          {/* Results Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong p-8 rounded-3xl space-y-6"
          >
            {/* Overall Performance */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {getAccuracyPercentage()}%
              </div>
              <div className="text-white/70">معدل الدقة</div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {studySession.correctAnswers}
                </div>
                <div className="text-sm text-white/70">إجابات صحيحة</div>
              </div>
              
              <div className="glass p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {studySession.wrongAnswers}
                </div>
                <div className="text-sm text-white/70">إجابات خاطئة</div>
              </div>
              
              <div className="glass p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {studySession.skippedCards}
                </div>
                <div className="text-sm text-white/70">بطاقات مُتجاهلة</div>
              </div>
              
              <div className="glass p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-white/70">الوقت المستغرق</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 glass rounded-2xl">
              <p className="text-white font-medium">
                {getAccuracyPercentage() >= 80 ? '🎉 أداء ممتاز! استمر هكذا' :
                 getAccuracyPercentage() >= 60 ? '👍 أداء جيد! يمكنك التحسن أكثر' :
                 '💪 تحتاج لمزيد من المراجعة'}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button 
              onClick={() => window.location.reload()}
              className="w-full glass-button py-4 text-lg font-medium"
            >
              <RotateCcw className="w-5 h-5 ml-2" />
              مراجعة مرة أخرى
            </Button>
            
            <Link href={`/collections/${collectionId}`}>
              <Button 
                variant="outline"
                className="w-full glass border-white/30 hover:glass-strong py-4 text-white"
              >
                العودة للمجموعة
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!currentCard || !studySession) return null

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href={`/collections/${collectionId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="glass p-3 h-12 w-12"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">
                {collection?.name}
              </h1>
              <p className="text-white/70 text-sm">
                {currentCardIndex + 1} من {studySession.totalCards}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="ghost"
            size="sm"
            className="glass p-3 h-12 w-12"
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </Button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-4 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">التقدم</span>
            <span className="text-white font-medium">{getProgressPercentage()}%</span>
          </div>
          
          <div className="w-full h-2 glass rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-green-400 font-medium">{studySession.correctAnswers}</div>
              <div className="text-white/60">صحيح</div>
            </div>
            <div>
              <div className="text-red-400 font-medium">{studySession.wrongAnswers}</div>
              <div className="text-white/60">خطأ</div>
            </div>
            <div>
              <div className="text-blue-400 font-medium">{formatTime(timeElapsed)}</div>
              <div className="text-white/60">الوقت</div>
            </div>
          </div>
        </motion.div>

        {/* Study Card */}
        <motion.div
          key={currentCardIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="relative"
        >
          <div 
            className={`
              glass glass-${currentCard.color} p-8 rounded-3xl cursor-pointer
              min-h-[300px] flex flex-col justify-center
              ${isPaused ? 'opacity-50' : ''}
            `}
            onClick={() => !isPaused && setIsFlipped(!isFlipped)}
          >
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                    <span className="text-sm text-white/60">السؤال</span>
                  </div>
                  
                  <p className="text-white font-medium text-xl leading-relaxed">
                    {currentCard.front_text}
                  </p>
                  
                  <div className="flex items-center justify-center pt-6">
                    <div className="flex items-center gap-2 text-white/60">
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-sm">اضغط لرؤية الإجابة</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-sm text-white/60">الإجابة</span>
                  </div>
                  
                  <p className="text-white font-medium text-xl leading-relaxed">
                    {currentCard.back_text}
                  </p>
                  
                  {currentCard.notes && (
                    <div className="p-4 glass rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="text-xs text-white/60">ملاحظات</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {currentCard.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                handleBookmark()
              }}
              className={`
                absolute top-4 left-4 p-3 rounded-xl transition-all duration-300
                ${currentCard.is_bookmarked 
                  ? 'text-yellow-400 glass-strong' 
                  : 'text-white/60 hover:text-yellow-400 hover:glass'
                }
              `}
            >
              {currentCard.is_bookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {isFlipped && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <Button
              onClick={() => handleAnswer(false)}
              className="glass-button bg-red-500/80 hover:bg-red-500 py-4"
            >
              <X className="w-5 h-5 ml-1" />
              صعب
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="glass border-white/30 hover:glass-strong py-4 text-white"
            >
              <SkipForward className="w-5 h-5 ml-1" />
              تخطي
            </Button>
            
            <Button
              onClick={() => handleAnswer(true)}
              className="glass-button bg-green-500/80 hover:bg-green-500 py-4"
            >
              <Check className="w-5 h-5 ml-1" />
              سهل
            </Button>
          </motion.div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="glass-strong p-8 rounded-3xl text-center">
              <Pause className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">الجلسة متوقفة</h3>
              <p className="text-white/70 mb-6">خذ قسطاً من الراحة</p>
              <Button
                onClick={() => setIsPaused(false)}
                className="glass-button"
              >
                <Play className="w-4 h-4 ml-2" />
                متابعة
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function StudyPage() {
  return (
    <ProtectedRoute>
      <StudyPageContent />
    </ProtectedRoute>
  )
}
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase'
import { Card, CreateCardForm, StudyMode } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useCards(collectionId?: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // جلب البطاقات
  const fetchCards = async (collection_id?: string) => {
    const targetCollectionId = collection_id || collectionId
    
    if (!user || !targetCollectionId) {
      setCards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('collection_id', targetCollectionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCards(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('خطأ في جلب البطاقات')
    } finally {
      setLoading(false)
    }
  }

  // إنشاء بطاقة جديدة
  const createCard = async (cardData: CreateCardForm & { collection_id: string }) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single()

      if (error) throw error

      // إضافة البطاقة الجديدة للقائمة
      setCards(prev => [data, ...prev])
      
      toast.success('تم إنشاء البطاقة بنجاح! 🎉')
      return { data, error: null }
    } catch (err: any) {
      toast.error('خطأ في إنشاء البطاقة')
      return { error: err.message }
    }
  }

  // تحديث بطاقة
  const updateCard = async (id: string, updates: Partial<CreateCardForm>) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // تحديث البطاقة في القائمة
      setCards(prev => 
        prev.map(card => 
          card.id === id 
            ? { ...card, ...data }
            : card
        )
      )

      toast.success('تم تحديث البطاقة بنجاح!')
      return { data, error: null }
    } catch (err: any) {
      toast.error('خطأ في تحديث البطاقة')
      return { error: err.message }
    }
  }

  // حذف بطاقة
  const deleteCard = async (id: string) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      // إزالة البطاقة من القائمة
      setCards(prev => prev.filter(card => card.id !== id))
      
      toast.success('تم حذف البطاقة بنجاح')
      return { error: null }
    } catch (err: any) {
      toast.error('خطأ في حذف البطاقة')
      return { error: err.message }
    }
  }

  // تبديل العلامة المرجعية
  const toggleBookmark = async (id: string) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    const card = cards.find(c => c.id === id)
    if (!card) return { error: 'البطاقة غير موجودة' }

    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ is_bookmarked: !card.is_bookmarked })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // تحديث البطاقة في القائمة
      setCards(prev => 
        prev.map(c => 
          c.id === id 
            ? { ...c, is_bookmarked: !c.is_bookmarked }
            : c
        )
      )

      toast.success(
        !card.is_bookmarked 
          ? 'تم إضافة البطاقة للمفضلة! ⭐' 
          : 'تم إزالة البطاقة من المفضلة'
      )
      
      return { data, error: null }
    } catch (err: any) {
      toast.error('خطأ في تحديث العلامة المرجعية')
      return { error: err.message }
    }
  }

  // جلب البطاقات للدراسة
  const getStudyCards = async (collection_id: string, mode: StudyMode = 'normal') => {
    if (!user) return { data: [], error: 'المستخدم غير مسجل' }

    try {
      let query = supabase
        .from('cards')
        .select('*')
        .eq('collection_id', collection_id)

      // تطبيق فلتر حسب النمط
      if (mode === 'bookmarked') {
        query = query.eq('is_bookmarked', true)
      }

      // ترتيب البطاقات
      if (mode === 'shuffle') {
        // للخلط العشوائي، نجلب البطاقات ثم نخلطها في الواجهة الأمامية
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      let studyCards = data || []

      // خلط البطاقات إذا كان النمط عشوائي
      if (mode === 'shuffle') {
        studyCards = [...studyCards].sort(() => Math.random() - 0.5)
      }

      return { data: studyCards, error: null }
    } catch (err: any) {
      return { data: [], error: err.message }
    }
  }

  // البحث في البطاقات
  const searchCards = async (searchTerm: string, collection_id?: string) => {
    if (!user || !searchTerm.trim()) {
      return cards
    }

    try {
      let query = supabase
        .from('cards')
        .select('*')
        .or(`front_text.ilike.%${searchTerm}%,back_text.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)

      if (collection_id) {
        query = query.eq('collection_id', collection_id)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (err: any) {
      toast.error('خطأ في البحث')
      return []
    }
  }

  // جلب إحصائيات البطاقات
  const getCardStats = async (collection_id: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id, is_bookmarked')
        .eq('collection_id', collection_id)

      if (error) throw error

      const total = data?.length || 0
      const bookmarked = data?.filter(card => card.is_bookmarked).length || 0

      return {
        total,
        bookmarked,
        percentage: total > 0 ? Math.round((bookmarked / total) * 100) : 0
      }
    } catch (err: any) {
      return null
    }
  }

  // الاستماع للتغييرات في البطاقات
  useEffect(() => {
    if (user && collectionId) {
      fetchCards(collectionId)

      // الاستماع للتغييرات الفورية
      const subscription = supabase
        .channel('cards_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'cards',
            filter: `collection_id=eq.${collectionId}`
          },
          (payload) => {
            console.log('Card change:', payload)
            // إعادة جلب البيانات عند التغيير
            fetchCards(collectionId)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, collectionId])

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    toggleBookmark,
    getStudyCards,
    searchCards,
    getCardStats,
    refetch: () => fetchCards(collectionId)
  }
}
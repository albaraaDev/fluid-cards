import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase'
import { Collection, CreateCollectionForm } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // جلب المجموعات
  const fetchCollections = async () => {
    if (!user) {
      setCollections([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('collections_with_count')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setCollections(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('خطأ في جلب المجموعات')
    } finally {
      setLoading(false)
    }
  }

  // إنشاء مجموعة جديدة
  const createCollection = async (collectionData: CreateCollectionForm) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([
          {
            ...collectionData,
            user_id: user.id,
          }
        ])
        .select()
        .single()

      if (error) throw error

      // إضافة المجموعة الجديدة للقائمة
      const newCollection = { ...data, cards_count: 0 }
      setCollections(prev => [newCollection, ...prev])
      
      toast.success('تم إنشاء المجموعة بنجاح! 🎉')
      return { data: newCollection, error: null }
    } catch (err: any) {
      toast.error('خطأ في إنشاء المجموعة')
      return { error: err.message }
    }
  }

  // تحديث مجموعة
  const updateCollection = async (id: string, updates: Partial<CreateCollectionForm>) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // تحديث المجموعة في القائمة
      setCollections(prev => 
        prev.map(collection => 
          collection.id === id 
            ? { ...collection, ...data }
            : collection
        )
      )

      toast.success('تم تحديث المجموعة بنجاح!')
      return { data, error: null }
    } catch (err: any) {
      toast.error('خطأ في تحديث المجموعة')
      return { error: err.message }
    }
  }

  // حذف مجموعة
  const deleteCollection = async (id: string) => {
    if (!user) return { error: 'المستخدم غير مسجل' }

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // إزالة المجموعة من القائمة
      setCollections(prev => prev.filter(collection => collection.id !== id))
      
      toast.success('تم حذف المجموعة بنجاح')
      return { error: null }
    } catch (err: any) {
      toast.error('خطأ في حذف المجموعة')
      return { error: err.message }
    }
  }

  // جلب مجموعة واحدة - تم إصلاح هذه الدالة
  const getCollection = async (id: string) => {
    if (!user) return { data: null, error: 'المستخدم غير مسجل' }

    try {
      // أولاً نجرب من collections_with_count
      let { data, error } = await supabase
        .from('collections_with_count')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      // إذا لم تنجح، نجرب من collections مباشرة
      if (error || !data) {
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (collectionError) throw collectionError

        // نحسب عدد البطاقات يدوياً
        const { count } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', id)

        data = { ...collectionData, cards_count: count || 0 }
      }

      return { data, error: null }
    } catch (err: any) {
      console.error('Error fetching collection:', err)
      return { data: null, error: err.message }
    }
  }

  // البحث في المجموعات
  const searchCollections = async (searchTerm: string) => {
    if (!user || !searchTerm.trim()) {
      return collections
    }

    try {
      // بحث بسيط في النام والوصف
      const filteredCollections = collections.filter(collection => 
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      
      return filteredCollections
    } catch (err: any) {
      toast.error('خطأ في البحث')
      return []
    }
  }

  // الاستماع للتغييرات في المجموعات
  useEffect(() => {
    if (user) {
      fetchCollections()

      // الاستماع للتغييرات الفورية
      const subscription = supabase
        .channel('collections_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'collections',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Collection change:', payload)
            // إعادة جلب البيانات عند التغيير
            fetchCollections()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollection,
    searchCollections,
    refetch: fetchCollections
  }
}
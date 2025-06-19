'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ColorPicker from '@/components/collections/ColorPicker'
import IconPicker from '@/components/collections/IconPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCollections } from '@/hooks/useCollections'
import { CollectionColor, CreateCollectionForm } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, Palette, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const createCollectionSchema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب').max(50, 'الاسم طويل جداً'),
  description: z.string().max(200, 'الوصف طويل جداً').optional(),
  color: z.string(),
  icon: z.string().min(1, 'الأيقونة مطلوبة'),
})

function NewCollectionPageContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<CollectionColor>('blue')
  const [selectedIcon, setSelectedIcon] = useState('📚')
  const { createCollection } = useCollections()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      color: 'blue',
      icon: '📚'
    }
  })

  const onSubmit = async (data: CreateCollectionForm) => {
    setIsLoading(true)
    
    const { data: newCollection, error } = await createCollection({
      ...data,
      color: selectedColor,
      icon: selectedIcon
    })

    if (!error && newCollection) {
      router.push(`/collections/${newCollection.id}`)
    }
    
    setIsLoading(false)
  }

  const handleColorChange = (color: CollectionColor) => {
    setSelectedColor(color)
    setValue('color', color)
  }

  const handleIconChange = (icon: string) => {
    setSelectedIcon(icon)
    setValue('icon', icon)
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="glass p-3 h-12 w-12"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">مجموعة جديدة</h1>
              <p className="text-white/70 text-sm">أنشئ مجموعة للبطاقات التعليمية</p>
            </div>
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">معاينة</h3>
          <div className={`glass glass-${selectedColor} p-6 rounded-3xl`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl glass-${selectedColor} 
                flex items-center justify-center text-2xl
              `}>
                {selectedIcon}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg">
                {watch('name') || 'اسم المجموعة'}
              </h3>
              
              {watch('description') && (
                <p className="text-sm text-white/70">
                  {watch('description')}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1 text-white/60">
                <span className="text-sm font-medium">0 بطاقة</span>
              </div>
              
              <div className="flex items-center gap-1 text-white/60">
                <span className="text-xs">الآن</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong p-8 rounded-3xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">
                اسم المجموعة *
              </Label>
              <Input
                id="name"
                placeholder="مثال: اللغة الإنجليزية"
                className="glass-input py-3"
                {...register('name')}
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium">
                الوصف (اختياري)
              </Label>
              <Textarea
                id="description"
                placeholder="وصف موجز عن محتوى المجموعة..."
                className="glass-input min-h-[100px] resize-none"
                {...register('description')}
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.description.message}
                </motion.p>
              )}
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                اللون
              </Label>
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={handleColorChange}
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-3">
              <Label className="text-white font-medium">
                الأيقونة
              </Label>
              <IconPicker
                selectedIcon={selectedIcon}
                onIconChange={handleIconChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full glass border-white/30 hover:glass-strong py-3 text-white"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </Link>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 glass-button py-3 relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإنشاء...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    إنشاء المجموعة
                  </div>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass p-4 rounded-2xl"
        >
          <h4 className="text-white font-medium mb-2">💡 نصائح</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• اختر اسماً واضحاً ومميزاً للمجموعة</li>
            <li>• استخدم الوصف لتوضيح محتوى المجموعة</li>
            <li>• اختر لوناً يساعدك في التمييز السريع</li>
            <li>• يمكنك تعديل هذه المعلومات لاحقاً</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default function NewCollectionPage() {
  return (
    <ProtectedRoute>
      <NewCollectionPageContent />
    </ProtectedRoute>
  )
}
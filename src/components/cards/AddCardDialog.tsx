'use client'

import ColorPicker from '@/components/collections/ColorPicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCards } from '@/hooks/useCards'
import { CollectionColor, CreateCardForm } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Palette, Save, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const createCardSchema = z.object({
  front_text: z.string().min(1, 'النص الأمامي مطلوب').max(500, 'النص طويل جداً'),
  back_text: z.string().min(1, 'النص الخلفي مطلوب').max(500, 'النص طويل جداً'),
  notes: z.string().max(300, 'الملاحظات طويلة جداً').optional(),
  color: z.string(),
})

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionColor: CollectionColor
}

export default function AddCardDialog({ 
  open, 
  onOpenChange, 
  collectionId, 
  collectionColor 
}: AddCardDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<CollectionColor>(collectionColor)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front')
  const { createCard } = useCards()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateCardForm>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      front_text: '',
      back_text: '',
      notes: '',
      color: collectionColor
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: CreateCardForm) => {
    setIsLoading(true)
    
    const { error } = await createCard({
      ...data,
      color: selectedColor,
      collection_id: collectionId
    })

    if (!error) {
      reset()
      setSelectedColor(collectionColor)
      setPreviewSide('front')
      onOpenChange(false)
    }
    
    setIsLoading(false)
  }

  const handleColorChange = (color: CollectionColor) => {
    setSelectedColor(color)
    setValue('color', color)
  }

  const handleClose = () => {
    reset()
    setSelectedColor(collectionColor)
    setPreviewSide('front')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-0 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-white text-xl font-bold">
            إضافة بطاقة جديدة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">معاينة البطاقة</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSide('front')}
                  className={`
                    px-3 py-1 rounded-lg text-sm transition-all duration-300
                    ${previewSide === 'front' 
                      ? 'glass-strong text-white' 
                      : 'text-white/60 hover:text-white'
                    }
                  `}
                >
                  الأمامي
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide('back')}
                  className={`
                    px-3 py-1 rounded-lg text-sm transition-all duration-300
                    ${previewSide === 'back' 
                      ? 'glass-strong text-white' 
                      : 'text-white/60 hover:text-white'
                    }
                  `}
                >
                  الخلفي
                </button>
              </div>
            </div>

            <div className={`glass glass-${selectedColor} p-4 rounded-2xl min-h-[120px] flex flex-col justify-center`}>
              {previewSide === 'front' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                    <span className="text-xs text-white/60">الوجه الأمامي</span>
                  </div>
                  <p className="text-white font-medium">
                    {watchedValues.front_text || 'اكتب السؤال هنا...'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-white/60">الوجه الخلفي</span>
                  </div>
                  <p className="text-white font-medium">
                    {watchedValues.back_text || 'اكتب الإجابة هنا...'}
                  </p>
                  {watchedValues.notes && (
                    <div className="mt-3 p-2 glass rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="text-xs text-white/60">ملاحظات</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {watchedValues.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Front Text */}
            <div className="space-y-2">
              <Label htmlFor="front_text" className="text-white font-medium">
                النص الأمامي (السؤال) *
              </Label>
              <Textarea
                id="front_text"
                placeholder="مثال: ما معنى كلمة Hello؟"
                className="glass-input min-h-[80px] resize-none"
                {...register('front_text')}
              />
              {errors.front_text && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.front_text.message}
                </motion.p>
              )}
            </div>

            {/* Back Text */}
            <div className="space-y-2">
              <Label htmlFor="back_text" className="text-white font-medium">
                النص الخلفي (الإجابة) *
              </Label>
              <Textarea
                id="back_text"
                placeholder="مثال: مرحباً"
                className="glass-input min-h-[80px] resize-none"
                {...register('back_text')}
              />
              {errors.back_text && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.back_text.message}
                </motion.p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white font-medium">
                ملاحظات (اختياري)
              </Label>
              <Textarea
                id="notes"
                placeholder="ملاحظات إضافية أو نصائح للذاكرة..."
                className="glass-input min-h-[60px] resize-none"
                {...register('notes')}
              />
              {errors.notes && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.notes.message}
                </motion.p>
              )}
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                لون البطاقة
              </Label>
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={handleColorChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 glass border-white/30 hover:glass-strong py-3 text-white"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 glass-button py-3 relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإضافة...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    إضافة البطاقة
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="glass p-3 rounded-2xl">
            <h4 className="text-white font-medium mb-2 text-sm">💡 نصائح لبطاقة فعالة</h4>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• اجعل السؤال واضحاً ومحدداً</li>
              <li>• استخدم إجابات موجزة وسهلة التذكر</li>
              <li>• أضف ملاحظات تساعدك في التذكر</li>
              <li>• اختر لوناً مناسباً لنوع المحتوى</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
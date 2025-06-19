'use client'

import ColorPicker from '@/components/collections/ColorPicker'
import IconPicker from '@/components/collections/IconPicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCollections } from '@/hooks/useCollections'
import { Collection, CollectionColor, CreateCollectionForm } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Palette, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const editCollectionSchema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب').max(50, 'الاسم طويل جداً'),
  description: z.string().max(200, 'الوصف طويل جداً').optional(),
  color: z.string(),
  icon: z.string().min(1, 'الأيقونة مطلوبة'),
})

interface EditCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: Collection
  onUpdate: (updatedCollection: Collection) => void
}

export default function EditCollectionDialog({ 
  open, 
  onOpenChange, 
  collection,
  onUpdate
}: EditCollectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<CollectionColor>(collection.color)
  const [selectedIcon, setSelectedIcon] = useState(collection.icon)
  const { updateCollection } = useCollections()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateCollectionForm>({
    resolver: zodResolver(editCollectionSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
      icon: collection.icon
    }
  })

  // إعادة تعيين القيم عند فتح الحوار
  useEffect(() => {
    if (open) {
      reset({
        name: collection.name,
        description: collection.description || '',
        color: collection.color,
        icon: collection.icon
      })
      setSelectedColor(collection.color)
      setSelectedIcon(collection.icon)
    }
  }, [open, collection, reset])

  const onSubmit = async (data: CreateCollectionForm) => {
    setIsLoading(true)
    
    const { data: updatedCollection, error } = await updateCollection(collection.id, {
      ...data,
      color: selectedColor,
      icon: selectedIcon
    })

    if (!error && updatedCollection) {
      onUpdate({ ...collection, ...updatedCollection })
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

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-0 max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-white text-xl font-bold">
            تعديل المجموعة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div className="space-y-3">
            <Label className="text-white font-medium">معاينة</Label>
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
                  {watch('name') || collection.name}
                </h3>
                
                {watch('description') && (
                  <p className="text-sm text-white/70">
                    {watch('description')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1 text-white/60">
                  <span className="text-sm font-medium">
                    {collection.cards_count || 0} بطاقة
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-white/60">
                  <span className="text-xs">محدث الآن</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    جاري التحديث...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Warning */}
          <div className="glass p-3 rounded-2xl border border-yellow-400/30">
            <h4 className="text-yellow-400 font-medium mb-2 text-sm">⚠️ تنبيه</h4>
            <p className="text-xs text-white/70">
              تحديث المجموعة سيؤثر على جميع البطاقات الموجودة بداخلها، لكن محتوى البطاقات لن يتغير.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
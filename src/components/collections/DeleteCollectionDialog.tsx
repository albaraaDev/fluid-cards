'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCollections } from '@/hooks/useCollections'
import { Collection } from '@/types'
import { motion } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface DeleteCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection: Collection
  onDelete: () => void
}

export default function DeleteCollectionDialog({ 
  open, 
  onOpenChange, 
  collection,
  onDelete
}: DeleteCollectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const { deleteCollection } = useCollections()

  const isConfirmValid = confirmText === collection.name

  const handleDelete = async () => {
    if (!isConfirmValid) return

    setIsLoading(true)
    
    const { error } = await deleteCollection(collection.id)

    if (!error) {
      onDelete()
      onOpenChange(false)
    }
    
    setIsLoading(false)
  }

  const handleClose = () => {
    setConfirmText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-0 max-w-md mx-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            حذف المجموعة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="glass p-4 rounded-2xl border border-red-400/30 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-400 font-medium mb-2">تحذير!</h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف المجموعة 
                  <span className="font-medium text-white"> "{collection.name}" </span>
                  وجميع البطاقات الموجودة بداخلها نهائياً.
                </p>
              </div>
            </div>
          </div>

          {/* Collection Info */}
          <div className={`glass glass-${collection.color} p-4 rounded-2xl opacity-75`}>
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl glass-${collection.color} 
                flex items-center justify-center text-2xl
              `}>
                {collection.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {collection.name}
                </h3>
                <p className="text-white/70 text-sm">
                  {collection.cards_count || 0} بطاقة سيتم حذفها
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <Label className="text-white font-medium">
              لتأكيد الحذف، اكتب اسم المجموعة بالضبط:
            </Label>
            <div className="space-y-2">
              <div className="glass p-3 rounded-xl">
                <code className="text-blue-300 font-medium">
                  {collection.name}
                </code>
              </div>
              <Input
                placeholder="اكتب اسم المجموعة هنا..."
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="glass-input py-3"
                dir="auto"
              />
            </div>
            
            {confirmText && !isConfirmValid && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                اسم المجموعة غير مطابق
              </motion.p>
            )}

            {isConfirmValid && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm flex items-center gap-2"
              >
                ✓ تم التأكيد، يمكنك الآن الحذف
              </motion.p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 glass border-white/30 hover:glass-strong py-3 text-white"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            
            <Button
              onClick={handleDelete}
              disabled={!isConfirmValid || isLoading}
              className={`
                flex-1 py-3 transition-all duration-300
                ${isConfirmValid 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'glass cursor-not-allowed opacity-50'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الحذف...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  حذف نهائياً
                </div>
              )}
            </Button>
          </div>

          {/* Additional Warning */}
          <div className="text-center">
            <p className="text-xs text-white/50">
              تأكد من أنك تريد حذف هذه المجموعة فعلاً.<br />
              لن تتمكن من استرداد البيانات بعد الحذف.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
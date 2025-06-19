'use client'

import { CollectionColor } from '@/types'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  selectedColor: CollectionColor
  onColorChange: (color: CollectionColor) => void
}

const colors: { value: CollectionColor; name: string; gradient: string }[] = [
  { value: 'blue', name: 'أزرق', gradient: 'from-blue-400 to-blue-600' },
  { value: 'purple', name: 'بنفسجي', gradient: 'from-purple-400 to-purple-600' },
  { value: 'green', name: 'أخضر', gradient: 'from-green-400 to-green-600' },
  { value: 'orange', name: 'برتقالي', gradient: 'from-orange-400 to-orange-600' },
  { value: 'red', name: 'أحمر', gradient: 'from-red-400 to-red-600' },
  { value: 'pink', name: 'وردي', gradient: 'from-pink-400 to-pink-600' },
  { value: 'indigo', name: 'نيلي', gradient: 'from-indigo-400 to-indigo-600' },
  { value: 'teal', name: 'أخضر مزرق', gradient: 'from-teal-400 to-teal-600' },
  { value: 'cyan', name: 'سماوي', gradient: 'from-cyan-400 to-cyan-600' },
  { value: 'emerald', name: 'زمردي', gradient: 'from-emerald-400 to-emerald-600' },
  { value: 'violet', name: 'بنفسجي فاتح', gradient: 'from-violet-400 to-violet-600' },
  { value: 'amber', name: 'عنبري', gradient: 'from-amber-400 to-amber-600' },
]

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {colors.map((color, index) => (
        <motion.button
          key={color.value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onColorChange(color.value)}
          className="relative group"
        >
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${color.gradient}
            flex items-center justify-center transition-all duration-300
            ${selectedColor === color.value 
              ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
              : 'hover:shadow-lg'
            }
          `}>
            {selectedColor === color.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-white"
              >
                <Check className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="glass px-2 py-1 rounded-lg">
              <span className="text-xs text-white whitespace-nowrap">
                {color.name}
              </span>
            </div>
          </div>

          {/* Glow Effect */}
          {selectedColor === color.value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1.2 }}
              className={`
                absolute inset-0 rounded-xl bg-gradient-to-br ${color.gradient}
                blur-lg -z-10
              `}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}
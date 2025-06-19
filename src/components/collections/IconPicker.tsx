'use client'

import { motion } from 'framer-motion'

interface IconPickerProps {
  selectedIcon: string
  onIconChange: (icon: string) => void
}

const iconCategories = {
  education: {
    name: 'التعليم',
    icons: ['📚', '📖', '✏️', '📝', '🎓', '🏫', '👨‍🏫', '👩‍🏫', '🔬', '📐']
  },
  languages: {
    name: 'اللغات',
    icons: ['🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹', '🇯🇵', '🇰🇷', '🇨🇳', '🇷🇺']
  },
  subjects: {
    name: 'المواد الدراسية',
    icons: ['🔢', '➕', '📊', '🧮', '🔬', '⚗️', '🧪', '🔭', '🌍', '🏛️']
  },
  general: {
    name: 'عام',
    icons: ['💡', '🎯', '⭐', '🚀', '💎', '🏆', '🎨', '🎵', '⚽', '🎮']
  },
  technology: {
    name: 'التكنولوجيا',
    icons: ['💻', '📱', '⌨️', '🖥️', '🖱️', '🔌', '💾', '🔋', '📡', '🌐']
  },
  nature: {
    name: 'الطبيعة',
    icons: ['🌳', '🌸', '🌺', '🌻', '🍀', '🌿', '🦋', '🐝', '🌙', '☀️']
  }
}

export default function IconPicker({ selectedIcon, onIconChange }: IconPickerProps) {
  return (
    <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
      {Object.entries(iconCategories).map(([categoryKey, category]) => (
        <div key={categoryKey}>
          <h4 className="text-sm font-medium text-white/80 mb-2 px-1">
            {category.name}
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {category.icons.map((icon, index) => (
              <motion.button
                key={icon}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onIconChange(icon)}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-xl
                  transition-all duration-300 relative group
                  ${selectedIcon === icon 
                    ? 'glass-strong ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' 
                    : 'glass hover:glass-strong'
                  }
                `}
              >
                <span className="relative z-10">{icon}</span>
                
                {/* Selected Indicator */}
                {selectedIcon === icon && (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </motion.div>
                    
                    {/* Glow Effect */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.3, scale: 1.2 }}
                      className="absolute inset-0 bg-blue-400 rounded-xl blur-lg -z-10"
                    />
                  </>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </div>
        </div>
      ))}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}
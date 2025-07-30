// src/components/ui/EnhancedAnimations.tsx
'use client';

import React, { useEffect, useState } from 'react';

// ==========================================
// 9.1 تحسينات للآيباد
// ==========================================

/**
 * مكون محسن للآيباد مع أزرار كبيرة وتخطيط مرن
 */
export const iPadOptimizedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'lg', 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = `
    relative overflow-hidden font-semibold rounded-2xl transition-all duration-300 
    transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;
  
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]',      // الحد الأدنى 44px للمس
    md: 'px-6 py-4 text-base min-h-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[56px] lg:min-h-[64px]',  // محسن للآيباد
    xl: 'px-12 py-6 text-xl min-h-[64px] lg:min-h-[72px]'
  };
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
      text-white shadow-lg hover:shadow-xl focus:ring-blue-500
    `,
    secondary: `
      bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500
      text-gray-200 shadow-md hover:shadow-lg focus:ring-gray-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700
      text-white shadow-lg hover:shadow-xl focus:ring-green-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
      text-white shadow-lg hover:shadow-xl focus:ring-red-500
    `
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {/* Ripple Effect Container */}
      <span className="absolute inset-0 overflow-hidden rounded-2xl">
        <span className="absolute inset-0 bg-white/20 scale-0 rounded-full transition-transform duration-500 origin-center hover:scale-150" />
      </span>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-3">
        {children}
      </span>
    </button>
  );
};

/**
 * Grid محسن للآيباد مع breakpoints ذكية
 */
export const iPadOptimizedGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}> = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4 lg:gap-6',
  className = ''
}) => {
  const gridClasses = `
    grid 
    grid-cols-${cols.sm || 1} 
    md:grid-cols-${cols.md || 2} 
    lg:grid-cols-${cols.lg || 3} 
    xl:grid-cols-${cols.xl || 4}
    ${gap}
    ${className}
  `;
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// ==========================================
// 9.2 الرسوم المتحركة المتقدمة
// ==========================================

/**
 * مكون الانتقالات السلسة
 */
export const SmoothTransition: React.FC<{
  children: React.ReactNode;
  show: boolean;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-right' | 'slide-left' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
}> = ({ 
  children, 
  show, 
  type = 'fade', 
  duration = 300,
  delay = 0
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  
  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);
  
  if (!shouldRender) return null;
  
  const transitionClasses = {
    fade: show 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-4',
    'slide-up': show 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-8',
    'slide-down': show 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 -translate-y-8',
    'slide-right': show 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 -translate-x-8',
    'slide-left': show 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 translate-x-8',
    scale: show 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95',
    bounce: show 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-110'
  };
  
  return (
    <div 
      className={`
        transition-all ease-out
        ${transitionClasses[type]}
      `}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * شريط التقدم المتحرك
 */
export const AnimatedProgressBar: React.FC<{
  progress: number;
  height?: string;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
}> = ({ 
  progress, 
  height = 'h-3',
  color = 'from-blue-500 to-purple-600',
  backgroundColor = 'bg-gray-700',
  showPercentage = false,
  animated = true
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);
  
  return (
    <div className="relative">
      <div className={`w-full ${backgroundColor} ${height} rounded-full overflow-hidden`}>
        <div 
          className={`${height} bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${Math.min(100, Math.max(0, animatedProgress))}%` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {showPercentage && (
        <div className="text-center mt-2 text-sm font-semibold">
          <span className="text-gray-300">{Math.round(animatedProgress)}%</span>
        </div>
      )}
    </div>
  );
};

/**
 * تأثير النجاح مع Confetti
 */
export const SuccessConfetti: React.FC<{
  show: boolean;
  onComplete?: () => void;
}> = ({ show, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
  }>>([]);
  
  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 2000
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show || particles.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// 9.3 الأصوات والتغذية الراجعة
// ==========================================

/**
 * مدير الأصوات والاهتزاز
 */
export class FeedbackManager {
  private static audioContext: AudioContext | null = null;
  private static sounds: { [key: string]: AudioBuffer } = {};
  
  // تشغيل الاهتزاز (للأجهزة المدعومة)
  static vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
  
  // تشغيل صوت النجاح
  static playSuccessSound() {
    this.playTone(800, 200); // نغمة عالية قصيرة
    setTimeout(() => this.playTone(1000, 150), 100);
  }
  
  // تشغيل صوت الخطأ
  static playErrorSound() {
    this.playTone(300, 300); // نغمة منخفضة طويلة
  }
  
  // تشغيل صوت النقر
  static playClickSound() {
    this.playTone(600, 50); // نغمة متوسطة قصيرة جداً
  }
  
  // إنشاء نغمة
  private static playTone(frequency: number, duration: number) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      // تجاهل الأخطاء الصوتية
      console.warn('Audio not supported:', error);
    }
  }
}

/**
 * زر مع تغذية راجعة صوتية واهتزاز
 */
export const FeedbackButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  feedbackType?: 'click' | 'success' | 'error';
  vibration?: boolean;
  sound?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  feedbackType = 'click',
  vibration = true,
  sound = true,
  className = ''
}) => {
  const handleClick = () => {
    // تشغيل التغذية الراجعة
    if (sound) {
      switch (feedbackType) {
        case 'success':
          FeedbackManager.playSuccessSound();
          break;
        case 'error':
          FeedbackManager.playErrorSound();
          break;
        default:
          FeedbackManager.playClickSound();
      }
    }
    
    if (vibration) {
      switch (feedbackType) {
        case 'success':
          FeedbackManager.vibrate([50, 50, 100]);
          break;
        case 'error':
          FeedbackManager.vibrate([100, 50, 100, 50, 100]);
          break;
        default:
          FeedbackManager.vibrate(50);
      }
    }
    
    onClick?.();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-200 transform hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
      
      {/* Visual Feedback Ripple */}
      <span className="absolute inset-0 bg-white/10 scale-0 rounded-full transition-transform duration-300 origin-center active:scale-150" />
    </button>
  );
};

// ==========================================
// 9.4 إمكانية الوصول
// ==========================================

/**
 * مكون محسن لإمكانية الوصول
 */
export const AccessibleCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  ariaDescription?: string;
  tabIndex?: number;
  role?: string;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  ariaLabel, 
  ariaDescription,
  tabIndex = 0,
  role = "button",
  className = ''
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  
  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyPress}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription}
      className={`
        focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * نص قابل للتدرج (Text Scaling)
 */
export const ScalableText: React.FC<{
  children: React.ReactNode;
  baseSize?: string;
  className?: string;
}> = ({ children, baseSize = 'text-base', className = '' }) => {
  return (
    <span className={`${baseSize} transition-all duration-200 ${className}`}>
      {children}
    </span>
  );
};

/**
 * وضع التباين العالي
 */
export const HighContrastToggle: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  
  useEffect(() => {
    // تطبيق وضع التباين العالي
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-all focus:outline-none focus:ring-4 focus:ring-blue-500"
      aria-label={highContrast ? 'إيقاف وضع التباين العالي' : 'تفعيل وضع التباين العالي'}
    >
      <span className="text-sm font-medium">
        {highContrast ? '🔆' : '🌙'} تباين عالي
      </span>
    </button>
  );
};

// ==========================================
// CSS المساعد للرسوم المتحركة
// ==========================================

export const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3) rotate(-45deg); opacity: 0; }
      50% { transform: scale(1.05) rotate(-10deg); }
      70% { transform: scale(0.9) rotate(3deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    .animate-bounce-in {
      animation: bounce-in 0.6s ease-out;
    }
    
    @keyframes slide-up-fade {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    .animate-slide-up-fade {
      animation: slide-up-fade 0.5s ease-out;
    }
    
    /* High Contrast Mode */
    .high-contrast {
      filter: contrast(150%) brightness(110%);
    }
    
    .high-contrast * {
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
    }
    
    /* Touch Improvements for iPad */
    @media (hover: none) and (pointer: coarse) {
      .touch-manipulation {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      button, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
    }
    
    /* Responsive Font Scaling */
    @media screen and (min-width: 1024px) {
      .text-responsive-sm { font-size: 0.9rem; }
      .text-responsive-base { font-size: 1.1rem; }
      .text-responsive-lg { font-size: 1.3rem; }
      .text-responsive-xl { font-size: 1.6rem; }
      .text-responsive-2xl { font-size: 2rem; }
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

const EnhancedAnimations = {
  iPadOptimizedButton,
  iPadOptimizedGrid,
  SmoothTransition,
  AnimatedProgressBar,
  SuccessConfetti,
  FeedbackManager,
  FeedbackButton,
  AccessibleCard,
  ScalableText,
  HighContrastToggle,
  AnimationStyles
};

export default EnhancedAnimations;
// src/components/SoundFeedback.tsx
'use client';

import React, { useCallback, useRef } from 'react';

export type SoundType = 
  | 'success'     // إجابة صحيحة
  | 'error'       // إجابة خاطئة
  | 'flip'        // قلب البطاقة
  | 'swipe'       // تمرير البطاقة
  | 'complete'    // إكمال الجلسة
  | 'streak'      // streak جديد
  | 'tick'        // تفاعل عام
  | 'timer';      // تحذير الوقت

interface SoundFeedbackProps {
  enabled?: boolean;
  volume?: number; // 0.0 to 1.0
}

// الأصوات المُولَّدة برمجياً باستخدام Web Audio API
const SoundFeedback: React.FC<SoundFeedbackProps> = ({ 
  enabled = true, 
  volume = 0.3 
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // إنشاء AudioContext عند الحاجة
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // إنشاء صوت برمجياً
  const createTone = useCallback((
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    fadeOut: boolean = true
  ) => {
    if (!enabled) return;

    try {
      const audioContext = getAudioContext();
      
      // إنشاء Oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // إعداد الصوت
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // إعداد الصوت
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      
      if (fadeOut) {
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + duration * 0.7);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      } else {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + duration);
      }
      
      // ربط العقد
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // تشغيل الصوت
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
    } catch (error) {
      console.warn('خطأ في تشغيل الصوت:', error);
    }
  }, [enabled, volume, getAudioContext]);

  // إنشاء أصوات مركبة
  const createChord = useCallback((frequencies: number[], duration: number) => {
    frequencies.forEach(freq => {
      createTone(freq, duration, 'sine', true);
    });
  }, [createTone]);

  // تشغيل الأصوات المختلفة
  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    switch (type) {
      case 'success':
        // صوت نجاح - أكورد صاعد
        createChord([523.25, 659.25, 783.99], 0.5); // C5, E5, G5
        break;
        
      case 'error':
        // صوت خطأ - نغمة هابطة
        createTone(220, 0.15, 'square', false);
        setTimeout(() => createTone(196, 0.15, 'square', false), 150);
        setTimeout(() => createTone(174, 0.2, 'square', true), 300);
        break;
        
      case 'flip':
        // صوت قلب - نغمة سريعة صاعدة
        createTone(440, 0.1, 'triangle', true);
        setTimeout(() => createTone(554.37, 0.1, 'triangle', true), 50);
        break;
        
      case 'swipe':
        // صوت تمرير - whoosh ناعم
        createTone(880, 0.15, 'sawtooth', true);
        break;
        
      case 'complete':
        // صوت إكمال - fanfare بسيط
        createChord([523.25, 659.25, 783.99, 1046.5], 0.8); // C5, E5, G5, C6
        setTimeout(() => createChord([587.33, 739.99, 880, 1174.66], 0.8), 400); // D5, F#5, A5, D6
        break;
        
      case 'streak':
        // صوت streak - نغمات سريعة صاعدة
        [261.63, 329.63, 392, 523.25].forEach((freq, index) => {
          setTimeout(() => createTone(freq, 0.1, 'sine', true), index * 50);
        });
        break;
        
      case 'tick':
        // صوت تفاعل - نقرة خفيفة
        createTone(800, 0.05, 'square', true);
        break;
        
      case 'timer':
        // صوت تحذير - نبضات سريعة
        createTone(1000, 0.1, 'sine', false);
        setTimeout(() => createTone(1000, 0.1, 'sine', false), 150);
        break;
        
      default:
        // صوت افتراضي
        createTone(440, 0.1, 'sine', true);
        break;
    }
  }, [enabled, createTone, createChord]);

  // Hook للاستخدام في المكونات الأخرى
  React.useEffect(() => {
    // إتاحة الدالة عالمياً للاستخدام السهل
    (window as any).playStudySound = playSound;
    
    return () => {
      delete (window as any).playStudySound;
    };
  }, [playSound]);

  // تنظيف AudioContext عند الإلغاء
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // هذا المكون لا يرندر أي شيء - فقط يوفر الوظائف الصوتية
  return null;
};

// Hook للاستخدام السهل
export const useSoundFeedback = (enabled: boolean = true) => {
  const playSound = useCallback((type: SoundType) => {
    if (enabled && (window as any).playStudySound) {
      (window as any).playStudySound(type);
    }
  }, [enabled]);

  return { playSound };
};

export default SoundFeedback;
import { supabase } from '@/lib/supabase';
import { CloudService } from '@/services/cloudService';
import { AuthUser } from '@/types/supabase';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // التأكد من أننا في client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    // التحقق من المستخدم الحالي
    const getInitialUser = async () => {
      try {
        // التأكد من استلام session أولاً
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at!,
          });
        }
      } catch (err) {
        console.error('Error getting user:', err);
        if (mounted) {
          setError('فشل في تحميل بيانات المستخدم');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at!,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isClient]);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await CloudService.signUp(email, password);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في التسجيل');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await CloudService.signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await CloudService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الخروج');
      throw err;
    }
  };

  return {
    user: isClient ? user : null, // فقط في client-side
    loading: !isClient || loading, // loading حتى client-side يكون جاهز
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: isClient && !!user,
  };
}
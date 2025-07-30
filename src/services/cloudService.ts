import { supabase } from '@/lib/supabase';
import { AppData, Word } from '@/types/flashcard';
import { CloudSyncStatus, UserData } from '@/types/supabase';

export class CloudService {
  // 🔐 المصادقة
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    // استخدام getSession بدلاً من getUser لتجنب session errors
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  }

  // 💾 إدارة البيانات السحابية
  static async saveToCloud(appData: AppData, dataName: string = 'البيانات الرئيسية'): Promise<UserData> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    const userData: Partial<UserData> = {
      user_id: user.id,
      data_name: dataName,
      words: appData.words,
      categories: appData.categories,
      metadata: {
        totalWords: appData.words.length,
        masteredWords: appData.words.filter(w => w.repetition >= 3 && w.interval >= 21).length,
        appVersion: appData.version || '2.0',
        deviceInfo: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      },
    };

    // البحث عن بيانات موجودة بنفس الاسم
    const { data: existingData } = await supabase
      .from('user_data')
      .select('id')
      .eq('user_id', user.id)
      .eq('data_name', dataName)
      .eq('is_active', true)
      .single();

    let result;
    if (existingData) {
      // تحديث البيانات الموجودة
      const { data, error } = await supabase
        .from('user_data')
        .update(userData)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // إنشاء بيانات جديدة
      const { data, error } = await supabase
        .from('user_data')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  }

  static async loadFromCloud(dataId?: string): Promise<AppData> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    let query = supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (dataId) {
      query = query.eq('id', dataId);
    } else {
      // احضار أحدث البيانات
      query = query.order('updated_at', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();
    if (error) throw error;

    return {
      words: data.words,
      categories: data.categories,
      savedAt: new Date(data.updated_at).getTime(),
      version: data.metadata?.appVersion || '2.0',
    };
  }

  static async getUserDataList(): Promise<UserData[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async deleteFromCloud(dataId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    const { error } = await supabase
      .from('user_data')
      .update({ is_active: false })
      .eq('id', dataId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // 🔄 حالة المزامنة
  static async checkConnection(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }

  // 📊 إحصائيات السحابة
  static async getCloudStats() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('metadata, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    const totalBackups = data.length;
    const totalWords = data.reduce((sum, item) => sum + (item.metadata?.totalWords || 0), 0);
    const lastBackup = data.length > 0 ? new Date(Math.max(...data.map(item => new Date(item.updated_at).getTime()))) : null;

    return {
      totalBackups,
      totalWords,
      lastBackup,
      storageUsed: JSON.stringify(data).length, // تقريبي
    };
  }
}
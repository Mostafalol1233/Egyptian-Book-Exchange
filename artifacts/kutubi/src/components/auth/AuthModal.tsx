import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FcGoogle } from 'react-icons/fc';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError('تعذّر التسجيل بجوجل. تأكد من الإعداد في Supabase وجوجل Console.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        // Show confirmation screen
        setAwaitingConfirm(true);
      }
    } catch (err: any) {
      let msg: string = err?.message || '';
      if (msg.includes('Invalid login credentials'))
        msg = 'البريد أو كلمة المرور غير صحيحة.';
      else if (msg.includes('already registered') || msg.includes('User already registered'))
        msg = 'هذا البريد مسجّل مسبقاً — سجّل دخولك بدلاً من ذلك.';
      else if (msg.includes('Password should be'))
        msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('invalid'))
        msg = 'البريد الإلكتروني غير صالح.';
      else if (msg.includes('Email not confirmed'))
        msg = 'لم تؤكّد بريدك بعد — افتح الإيميل اللي وصلك واضغط رابط التأكيد، ثم ارجع وسجّل دخولك.';
      else if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email'))
        msg = 'محاولات كثيرة — انتظر دقيقة وحاول مجدداً.';
      else if (!msg)
        msg = 'حدث خطأ غير متوقع. حاول مرة أخرى.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError('');
    setAwaitingConfirm(false);
  };

  // --- Awaiting email confirmation screen ---
  if (awaitingConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold">تأكيد البريد الإلكتروني</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">اتحقّق من بريدك</h3>
            <p className="text-muted-foreground mb-2">
              بعتنالك إيميل على <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              افتح الإيميل واضغط على رابط التأكيد، وبعدين ارجع هنا وسجّل دخولك.
            </p>
            <button
              onClick={() => { setAwaitingConfirm(false); setIsLogin(true); }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors"
            >
              أكّدت الإيميل — سجّل دخولي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main modal ---
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Google — live button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <FcGoogle className="w-6 h-6" />
            {isLogin ? 'تسجيل الدخول باستخدام جوجل' : 'التسجيل باستخدام جوجل'}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">أو بالبريد الإلكتروني</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">الاسم الكامل</label>
                <input
                  type="text" required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="محمد أحمد"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">البريد الإلكتروني</label>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-left"
                dir="ltr"
                placeholder="yourname@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">كلمة المرور</label>
              <input
                type="password" required minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-left"
                dir="ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <p>ليس لديك حساب؟{' '}
                <button type="button" onClick={switchMode} className="text-primary font-bold hover:underline">إنشاء حساب</button>
              </p>
            ) : (
              <p>لديك حساب؟{' '}
                <button type="button" onClick={switchMode} className="text-primary font-bold hover:underline">تسجيل الدخول</button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

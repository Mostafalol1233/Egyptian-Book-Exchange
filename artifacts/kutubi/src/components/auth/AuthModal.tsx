import { useState } from 'react';
import { X, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [success, setSuccess] = useState('');
  const [showGoogleInfo, setShowGoogleInfo] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
        setSuccess('تم إنشاء الحساب بنجاح! تحقق من بريدك لتأكيد الحساب ثم سجّل دخولك.');
      }
    } catch (err: any) {
      let msg: string = err?.message || '';
      if (msg.includes('Invalid login credentials'))
        msg = 'بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.';
      else if (msg.includes('already registered') || msg.includes('User already registered'))
        msg = 'هذا البريد الإلكتروني مسجل بالفعل. سجّل دخولك.';
      else if (msg.includes('Password should be'))
        msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('invalid'))
        msg = 'البريد الإلكتروني غير صالح. تأكد من كتابته بشكل صحيح (مثال: name@gmail.com).';
      else if (msg.includes('Email not confirmed'))
        msg = 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.';
      else if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email_send_rate_limit'))
        msg = 'محاولات كثيرة جداً. انتظر دقيقة ثم حاول مجدداً.';
      else if (msg.includes('Network') || msg.includes('fetch'))
        msg = 'خطأ في الاتصال. تحقق من الإنترنت وحاول مجدداً.';
      setError(msg || 'حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Google Button — disabled, needs Google Console setup */}
          <div className="space-y-2">
            <div
              className="w-full flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed select-none"
              title="يحتاج إعداد"
            >
              <FcGoogle className="w-6 h-6 opacity-50" />
              {isLogin ? 'تسجيل الدخول باستخدام جوجل' : 'التسجيل باستخدام جوجل'}
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">يحتاج إعداد</span>
            </div>

            {/* Collapsible setup instructions */}
            <button
              type="button"
              onClick={() => setShowGoogleInfo(v => !v)}
              className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              كيف تفعّل تسجيل الدخول بجوجل؟
              {showGoogleInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showGoogleInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 leading-relaxed" dir="rtl">
                <p className="font-bold mb-2">خطوات تفعيل جوجل OAuth:</p>
                <p>١. افتح <strong>Google Cloud Console</strong> ← APIs ← Credentials</p>
                <p>٢. في OAuth client، أضف هذا الرابط في Authorized redirect URIs:</p>
                <code className="block bg-white border border-amber-200 rounded px-2 py-1 text-[10px] break-all mt-1 mb-2" dir="ltr">
                  https://hivmapciasjbnyyisjyd.supabase.co/auth/v1/callback
                </code>
                <p>٣. في <strong>Supabase Dashboard</strong> ← Authentication ← Providers ← Google، فعّل Google وأضف Client ID وSecret.</p>
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">سجّل بالبريد الإلكتروني</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm rounded-lg bg-green-50 text-green-700 border border-green-100">
                {success}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">الاسم الكامل</label>
                <input
                  type="text"
                  required
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
                type="email"
                required
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
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-left"
                dir="ltr"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">٦ أحرف أو أكثر</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري المعالجة...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <p>
                ليس لديك حساب؟{' '}
                <button type="button" onClick={switchMode} className="text-primary font-bold hover:underline">
                  إنشاء حساب جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button type="button" onClick={switchMode} className="text-primary font-bold hover:underline">
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

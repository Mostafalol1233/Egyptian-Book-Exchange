import { Link } from 'wouter';
import { useAuth } from '@/lib/context/AuthContext';
import { BookPlus, User, LogOut, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';

function KutubiLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hdrBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#0d6b6b"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#hdrBg)"/>
      <path d="M50 21 L18 29 L18 67 L50 59 Z" fill="white" opacity="0.95"/>
      <path d="M50 21 L82 13 L82 51 L50 59 Z" fill="white" opacity="0.72"/>
      <line x1="26" y1="40" x2="44" y2="43.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.32"/>
      <line x1="26" y1="48" x2="44" y2="51.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.32"/>
      <line x1="58" y1="27" x2="74" y2="23" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.32"/>
      <line x1="58" y1="35" x2="74" y2="31" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.32"/>
      <path d="M30 73 Q50 83 70 73" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <polyline points="65,68 70,73 75,70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="transition-transform group-hover:scale-105 duration-200">
              <KutubiLogo />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-foreground">كُتُبي</span>
              <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">تبادل الكتب المدرسية</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/sell"
                  className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl font-bold transition-all text-sm shadow-sm hover:shadow-md"
                >
                  <BookPlus className="w-4 h-4" />
                  بيع كتابك
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-primary/20 hover:border-primary/60 transition-all hover:shadow-sm"
                    aria-label="قائمة المستخدم"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>

                  {menuOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute left-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-border mb-1">
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-sm font-medium transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          لوحة التحكم
                        </Link>
                        <Link href="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-sm font-medium transition-colors">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          المحادثات
                        </Link>
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-sm font-medium transition-colors">
                          <User className="w-4 h-4 text-primary" />
                          الملف الشخصي
                        </Link>
                        <div className="h-px bg-border my-1.5" />
                        <button
                          onClick={() => { setMenuOpen(false); signOut(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-destructive/10 text-destructive text-sm font-medium transition-colors text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl font-bold transition-all text-sm shadow-sm hover:shadow-md"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

import { Link } from 'wouter';
import { useAuth } from '@/lib/context/AuthContext';
import { BookPlus, User, LogOut, MessageSquare, LayoutDashboard, Menu, X, BookMarked } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';

function KutubiLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hdrBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#0d6b6b"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#hdrBg)"/>
      {/* Left page */}
      <path d="M50 20 L18 29 L18 70 L50 61 Z" fill="white" opacity="0.95"/>
      {/* Right page */}
      <path d="M50 20 L82 11 L82 52 L50 61 Z" fill="white" opacity="0.75"/>
      {/* Spine */}
      <rect x="48" y="20" width="4" height="41" rx="2" fill="#0d6b6b" opacity="0.35"/>
      {/* Lines left page */}
      <line x1="26" y1="42" x2="43" y2="45.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.4"/>
      <line x1="26" y1="50" x2="43" y2="53.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.4"/>
      {/* Lines right page */}
      <line x1="57" y1="28" x2="74" y2="23.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.4"/>
      <line x1="57" y1="36" x2="74" y2="31.5" stroke="#0d6b6b" strokeWidth="2.2" strokeLinecap="round" opacity="0.4"/>
      {/* Exchange arrow (bidirectional arc at bottom) */}
      <path d="M28 77 Q50 89 72 77" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
      <polyline points="67,71 72,77 77,74" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="33,71 28,77 23,74" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group select-none flex-shrink-0">
            <div className="transition-transform group-hover:scale-105 duration-200 drop-shadow-sm">
              <KutubiLogo />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-foreground">كُتُبي</span>
              <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">تبادل الكتب المدرسية</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              تصفح الكتب
            </Link>
            <Link href="/requests" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <BookMarked className="w-3.5 h-3.5" />
              طلبات الكتب
            </Link>
            <Link href="/sell" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              بيع كتابك
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <Link
                  href="/sell"
                  className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl font-bold transition-all text-sm shadow-sm hover:shadow-md"
                >
                  <BookPlus className="w-4 h-4" />
                  <span className="hidden lg:inline">بيع كتابك</span>
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
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute left-0 top-12 w-56 bg-card border border-border rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2.5 border-b border-border mb-1">
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <p className="text-sm font-semibold text-foreground truncate">{user.user_metadata?.full_name || 'مستخدم'}</p>
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

            {/* Mobile nav toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="القائمة"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">تصفح الكتب</Link>
            <Link href="/requests" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors"><BookMarked className="w-4 h-4 text-primary" />طلبات الكتب</Link>
            <Link href="/sell" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">بيع كتابك</Link>
            {user && (
              <>
                <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">لوحة التحكم</Link>
                <Link href="/chat" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">المحادثات</Link>
              </>
            )}
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

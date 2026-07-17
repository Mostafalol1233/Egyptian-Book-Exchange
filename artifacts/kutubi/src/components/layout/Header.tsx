import { Link } from 'wouter';
import { useAuth } from '@/lib/context/AuthContext';
import { BookPlus, User, LogOut, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <BookPlus className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-foreground">كُتُبي</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/sell" className="hidden sm:flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  <BookPlus className="w-4 h-4" />
                  بيع كتابك
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 hover:border-primary/50 transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute left-0 top-12 w-48 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm font-medium">
                        <BookPlus className="w-4 h-4 text-primary" />
                        لوحة التحكم
                      </Link>
                      <Link href="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm font-medium">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        المحادثات
                      </Link>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm font-medium">
                        <User className="w-4 h-4 text-primary" />
                        الملف الشخصي
                      </Link>
                      <div className="h-px bg-border my-1"></div>
                      <button 
                        onClick={() => { setMenuOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive text-sm font-medium text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl font-bold transition-colors text-sm"
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
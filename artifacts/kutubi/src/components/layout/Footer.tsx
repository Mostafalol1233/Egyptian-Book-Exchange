import { Link } from 'wouter';
import { BookOpen, Heart, ShieldCheck } from 'lucide-react';

function KutubiLogoSmall() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ftBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#0d6b6b"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#ftBg)"/>
      <path d="M50 22 L20 30 L20 72 L50 64 Z" fill="white" opacity="0.95"/>
      <path d="M50 22 L80 14 L80 56 L50 64 Z" fill="white" opacity="0.75"/>
      <rect x="48" y="22" width="4" height="42" rx="2" fill="#0d6b6b" opacity="0.4"/>
      <path d="M32 78 Q50 87 68 78" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <polyline points="63,73 68,78 73,75" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="37,73 32,78 27,75" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <KutubiLogoSmall />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-foreground">كُتُبي</span>
                <span className="text-[10px] text-muted-foreground">تبادل الكتب المدرسية</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              منصة مجانية لبيع وشراء الكتب المدرسية المستعملة والجديدة لطلاب الثانوية والإعدادية في مصر.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>منصة آمنة — دائماً مجانية</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/>تصفح الكتب</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">بيع كتابك</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link></li>
              <li><Link href="/chat" className="hover:text-primary transition-colors">المحادثات</Link></li>
            </ul>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">نصائح للبائع</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-inside list-disc">
              <li>أضف صورة واضحة للغلاف</li>
              <li>اكتب وصفاً دقيقاً لحالة الكتاب</li>
              <li>حدد سعراً عادلاً ومناسباً</li>
              <li>تأكد من بيانات التواصل الصحيحة</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} كُتُبي — جميع الحقوق محفوظة</span>
          <span className="flex items-center gap-1">
            صُنع بـ <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> لطلاب مصر
          </span>
        </div>
      </div>
    </footer>
  );
}

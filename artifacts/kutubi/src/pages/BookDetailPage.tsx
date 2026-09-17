import { useRoute, Link, useLocation } from 'wouter';
import { useBook } from '@/lib/hooks/useBooks';
import { useAuth } from '@/lib/context/AuthContext';
import { useStartConversation } from '@/lib/hooks/useChat';
import { formatArabicDate, formatPrice } from '@/lib/utils/arabic';
import { MapPin, Phone, MessageCircle, BookOpen, GraduationCap, Clock, Package, Share2, Tag, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function BookDetailPage() {
  const [, params] = useRoute('/book/:id');
  const id = params?.id;
  const [, setLocation] = useLocation();
  
  const { data: book, isLoading } = useBook(id || '');
  const { user } = useAuth();
  const startConversation = useStartConversation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center"><div className="animate-pulse flex flex-col items-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></div>;
  }

  if (!book) {
    return <div className="p-8 text-center text-xl">الكتاب غير موجود</div>;
  }

  const isFree = book.is_free || book.price === 0;
  const isCatalog = book.is_catalog === true;
  const isOwner = user?.id === book.seller_id;

  const handleContactSeller = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (isOwner) return;

    startConversation.mutate(
      { book_id: book.id, seller_id: book.seller_id, buyer_id: user.id },
      { onSuccess: (convId) => setLocation(`/chat/${convId}`) }
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `شوف الكتاب ده على كُتُبي: ${book.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <span>/</span>
        <span>{book.grade}</span>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl overflow-hidden aspect-[3/4] relative shadow-sm sticky top-24">
            {book.image_url ? (
              <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                <BookOpen className="w-20 h-20 mb-4 opacity-50" />
                <p>لا توجد صورة</p>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md backdrop-blur-md ${isFree ? 'bg-green-500 text-white' : 'bg-white text-slate-800'}`}>
                {isCatalog ? 'كتالوج' : formatPrice(book.price, book.is_free)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">{book.condition}</span>
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">{book.delivery === 'shipping' ? 'متاح الشحن' : 'استلام شخصي'}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">{book.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatArabicDate(book.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{book.city}، {book.governorate}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-xl">
              <span className="block text-xs text-muted-foreground mb-1">المادة</span>
              <span className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> {book.subject}
              </span>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl">
              <span className="block text-xs text-muted-foreground mb-1">الصف</span>
              <span className="font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> {book.grade}
              </span>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl">
              <span className="block text-xs text-muted-foreground mb-1">المدرس/الناشر</span>
              <span className="font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> {book.publisher}
              </span>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl">
              <span className="block text-xs text-muted-foreground mb-1">المسار</span>
              <span className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> {book.track}
              </span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="font-bold text-lg mb-2">وصف الكتاب</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line bg-card border border-border p-5 rounded-2xl">
                {book.description}
              </p>
            </div>
          )}
          
          {book.is_catalog && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              هذا كتاب مضاف إلى كتالوج كُتُبي. السعر والتوفر يحددهما البائع عند إضافة نسخة للبيع.
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            تأكد من معاينة الكتاب قبل الدفع. المنصة غير مسؤولة عن عمليات الدفع الخارجية.
          </div>
        </div>

        {/* Right Column: Seller Info */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg">{book.is_catalog ? 'كتالوج كُتُبي' : 'معلومات البائع'}</h3>
              <button onClick={handleShare} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground" title="مشاركة">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {!book.is_catalog && (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
                  {book.profiles?.avatar_url ? (
                    <img src={book.profiles.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    book.profiles?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{book.profiles?.full_name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{book.profiles?.city}، {book.profiles?.governorate}</span>
                  </div>
                </div>
              </div>
            )}

            {book.is_catalog ? (
              <div className="bg-primary/10 text-primary text-center py-4 rounded-xl font-bold border border-primary/20">
                كتاب كتالوج — غير متاح للبيع مباشرةً
              </div>
            ) : book.is_sold ? (
              <div className="bg-destructive/10 text-destructive text-center py-4 rounded-xl font-bold">
                تم بيع هذا الكتاب
              </div>
            ) : isOwner ? (
              <div className="bg-primary/10 text-primary text-center py-4 rounded-xl font-bold border border-primary/20">
                هذا الكتاب خاص بك
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={handleContactSeller}
                  disabled={startConversation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  <MessageCircle className="w-5 h-5" />
                  مراسلة البائع عبر المنصة
                </button>
                
                {book.profiles?.whatsapp && (
                  <a 
                    href={`https://wa.me/20${book.profiles.whatsapp.replace(/^0+/, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    تواصل واتساب
                  </a>
                )}
                
                {book.profiles?.phone && (
                  <a 
                    href={`tel:${book.profiles.phone}`}
                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-secondary-border"
                  >
                    <Phone className="w-5 h-5 rtl:-scale-x-100" />
                    اتصال هاتفي
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

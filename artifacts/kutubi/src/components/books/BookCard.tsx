import { Book } from '@/lib/hooks/useBooks';
import { formatArabicDate, formatPrice } from '@/lib/utils/arabic';
import { MapPin, Clock, BookOpen, GraduationCap, Tag, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const conditionConfig: Record<string, { label: string; color: string }> = {
  'جديد': { label: 'جديد', color: 'bg-emerald-500/90 text-white' },
  'مستعمل بشكل خفيف': { label: 'خفيف الاستخدام', color: 'bg-sky-500/90 text-white' },
  'مستعمل': { label: 'مستعمل', color: 'bg-amber-500/90 text-white' },
  'قديم': { label: 'قديم', color: 'bg-slate-500/90 text-white' },
};

export function BookCard({ book }: { book: Book }) {
  const isFree = book.is_free || book.price === 0;
  const cond = conditionConfig[book.condition] ?? { label: book.condition, color: 'bg-slate-500/90 text-white' };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.profiles?.whatsapp) {
      const phone = `20${book.profiles.whatsapp.replace(/^0+/, '')}`;
      const text = encodeURIComponent(`مرحباً، رأيت إعلانك عن كتاب "${book.title}" على كُتُبي وأريد الاستفسار.`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  };

  return (
    <Link href={`/book/${book.id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">

        {/* Image Area */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-teal-100/40">
              <BookOpen className="w-12 h-12 text-primary/30" />
            </div>
          )}

          {/* Price Badge — top right */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              "px-3 py-1.5 rounded-full text-sm font-bold shadow-sm backdrop-blur-md",
              isFree
                ? "bg-green-500/95 text-white"
                : "bg-white/95 text-slate-800"
            )}>
              {formatPrice(book.price, book.is_free)}
            </span>
          </div>

          {/* Condition badge — top left */}
          <div className="absolute top-3 left-3">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md", cond.color)}>
              {cond.label}
            </span>
          </div>

          {/* WhatsApp quick-contact on hover (only if seller has WhatsApp) */}
          {book.profiles?.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md translate-y-1 group-hover:translate-y-0"
              title="تواصل واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              واتساب
            </button>
          )}

          {/* Views count */}
          {book.views_count > 0 && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              <Eye className="w-3 h-3" />
              {book.views_count}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <BookOpen className="w-3 h-3" />
              {book.subject}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
              <GraduationCap className="w-3 h-3" />
              {book.grade}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
              <Tag className="w-3 h-3" />
              {book.publisher}
            </span>
          </div>

          <h3 className="font-bold text-base leading-snug mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>

          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{book.city}، {book.governorate}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatArabicDate(book.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

import { Book } from '@/lib/hooks/useBooks';
import { formatArabicDate, formatPrice } from '@/lib/utils/arabic';
import { MapPin, Clock, BookOpen, GraduationCap, Tag } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export function BookCard({ book }: { book: Book }) {
  const isFree = book.is_free || book.price === 0;

  return (
    <Link href={`/book/${book.id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        
        {/* Image Area */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {book.image_url ? (
            <img 
              src={book.image_url} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              "px-3 py-1.5 rounded-full text-sm font-bold shadow-sm backdrop-blur-md",
              isFree 
                ? "bg-green-500/90 text-white" 
                : "bg-white/90 text-slate-800"
            )}>
              {formatPrice(book.price, book.is_free)}
            </span>
          </div>
          
          {/* Grade Badge */}
          <div className="absolute top-3 left-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-white",
              book.grade === "أولى ثانوي" ? "bg-blue-500" :
              book.grade === "ثانية ثانوي" ? "bg-emerald-500" :
              "bg-orange-500"
            )}>
              {book.grade}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <BookOpen className="w-3 h-3" />
              {book.subject}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
              <GraduationCap className="w-3 h-3" />
              {book.track}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
              <Tag className="w-3 h-3" />
              {book.publisher}
            </span>
          </div>

          <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>

          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{book.city}، {book.governorate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatArabicDate(book.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

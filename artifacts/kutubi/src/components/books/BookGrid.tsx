import { Book } from '@/lib/hooks/useBooks';
import { BookCard } from './BookCard';
import { PackageOpen } from 'lucide-react';

export function BookGrid({ books, isLoading }: { books: Book[] | undefined, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden h-[380px] animate-pulse">
            <div className="h-[200px] bg-muted w-full"></div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded"></div>
                <div className="h-5 w-20 bg-muted rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
              <div className="pt-4 border-t border-border flex justify-between">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
          <PackageOpen className="w-12 h-12 text-primary/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">لا توجد كتب مطابقة</h3>
        <p className="text-muted-foreground max-w-md">
          لم نتمكن من العثور على كتب تطابق بحثك. جرب تغيير الفلاتر أو إزالة بعض شروط البحث.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

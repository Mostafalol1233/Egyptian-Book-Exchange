import { useAuth } from '@/lib/context/AuthContext';
import { useUserBooks, useUpdateBook, useDeleteBook } from '@/lib/hooks/useBooks';
import { formatArabicDate, formatPrice } from '@/lib/utils/arabic';
import { BookOpen, Edit, Trash2, CheckCircle, PackageOpen, MoreVertical } from 'lucide-react';
import { Link, useLocation, Redirect } from 'wouter';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { data: books, isLoading } = useUserBooks(user?.id);
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  if (loading) return null;
  if (!user) return <Redirect to="/" />;

  const handleMarkSold = (id: string, is_sold: boolean) => {
    updateBook.mutate({ id, updates: { is_sold: !is_sold } });
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب نهائياً؟')) {
      deleteBook.mutate(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm">إدارة كتبك المعروضة للبيع</p>
        </div>
        <Link href="/sell" className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
          أضف كتاب جديد
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-lg">كتبي المعروضة ({books?.length || 0})</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
        ) : books && books.length > 0 ? (
          <div className="divide-y divide-border">
            {books.map(book => (
              <div key={book.id} className={`p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors hover:bg-muted/10 ${book.is_sold ? 'opacity-70 grayscale-[30%]' : ''}`}>
                
                <Link href={`/book/${book.id}`} className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/book/${book.id}`} className="font-bold text-lg text-foreground hover:text-primary transition-colors block mb-1 truncate">
                    {book.title}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-muted px-2 py-0.5 rounded">{book.subject}</span>
                    <span className="bg-muted px-2 py-0.5 rounded">{book.grade}</span>
                    <span>{formatArabicDate(book.created_at)}</span>
                    <span className="text-primary font-bold mx-2">{formatPrice(book.price, book.is_free)}</span>
                  </div>
                  
                  {book.is_sold && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                      <CheckCircle className="w-3 h-3" /> تم البيع
                    </span>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleMarkSold(book.id, book.is_sold)}
                    disabled={updateBook.isPending}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      book.is_sold 
                        ? 'bg-background border-border text-foreground hover:bg-muted' 
                        : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {book.is_sold ? 'تراجع عن البيع' : 'تحديد كمباع'}
                  </button>
                  <button 
                    onClick={() => handleDelete(book.id)}
                    disabled={deleteBook.isPending}
                    className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg text-sm font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <PackageOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">لم تقم بعرض أي كتب بعد</h3>
            <p className="text-muted-foreground mb-6 text-sm">ابدأ بعرض كتبك القديمة للبيع وساعد طلاب آخرين.</p>
            <Link href="/sell" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-colors">
              عرض كتاب الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
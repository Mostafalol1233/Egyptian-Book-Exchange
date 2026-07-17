import { useAuth } from '@/lib/context/AuthContext';
import { useUserBooks, useUpdateBook, useDeleteBook } from '@/lib/hooks/useBooks';
import { formatArabicDate, formatPrice } from '@/lib/utils/arabic';
import { BookOpen, Trash2, CheckCircle, PackageOpen, Eye, Edit2, TrendingUp, BookMarked, Gift } from 'lucide-react';
import { Link, Redirect } from 'wouter';

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

  const activeBooks = books?.filter(b => !b.is_sold) ?? [];
  const soldBooks = books?.filter(b => b.is_sold) ?? [];
  const freeBooks = books?.filter(b => b.is_free) ?? [];
  const totalViews = books?.reduce((acc, b) => acc + (b.views_count || 0), 0) ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm">إدارة كتبك المعروضة للبيع</p>
        </div>
        <Link href="/sell" className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          أضف كتاب جديد
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && books && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <BookMarked className="w-4 h-4 text-primary" />
              كتب نشطة
            </div>
            <span className="text-3xl font-extrabold text-foreground">{activeBooks.length}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              تم بيعها
            </div>
            <span className="text-3xl font-extrabold text-foreground">{soldBooks.length}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Eye className="w-4 h-4 text-sky-500" />
              إجمالي المشاهدات
            </div>
            <span className="text-3xl font-extrabold text-foreground">{totalViews}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Gift className="w-4 h-4 text-emerald-500" />
              كتب مجانية
            </div>
            <span className="text-3xl font-extrabold text-foreground">{freeBooks.length}</span>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="font-bold text-lg">كتبي المعروضة ({books?.length || 0})</h2>
          {soldBooks.length > 0 && (
            <span className="text-xs text-muted-foreground">{soldBooks.length} منها تم بيعها</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
        ) : books && books.length > 0 ? (
          <div className="divide-y divide-border">
            {books.map(book => (
              <div key={book.id} className={`p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors hover:bg-muted/10 ${book.is_sold ? 'opacity-60' : ''}`}>

                <Link href={`/book/${book.id}`} className="w-20 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/book/${book.id}`} className="font-bold text-base text-foreground hover:text-primary transition-colors block mb-1 truncate">
                    {book.title}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-muted px-2 py-0.5 rounded-md">{book.subject}</span>
                    <span className="bg-muted px-2 py-0.5 rounded-md">{book.grade}</span>
                    <span className="bg-muted px-2 py-0.5 rounded-md">{book.condition}</span>
                    <span className="text-primary font-bold">{formatPrice(book.price, book.is_free)}</span>
                    <span>{formatArabicDate(book.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {book.views_count || 0} مشاهدة
                    </span>
                    {book.is_sold && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3 h-3" /> تم البيع
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  {!book.is_sold && (
                    <Link
                      href={`/edit/${book.id}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg text-sm font-bold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      تعديل
                    </Link>
                  )}
                  <button
                    onClick={() => handleMarkSold(book.id, book.is_sold)}
                    disabled={updateBook.isPending}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      book.is_sold
                        ? 'bg-background border-border text-foreground hover:bg-muted'
                        : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {book.is_sold ? 'تراجع' : 'تحديد كمباع'}
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={deleteBook.isPending}
                    className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold mb-2">لم تقم بعرض أي كتب بعد</h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-xs">ابدأ بعرض كتبك القديمة للبيع وساعد طلاب آخرين. المنصة مجانية تماماً!</p>
            <Link href="/sell" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-colors">
              عرض كتاب الآن
            </Link>
          </div>
        )}
      </div>

      {/* Tips for more views */}
      {books && books.length > 0 && activeBooks.length > 0 && (
        <div className="mt-6 bg-primary/5 border border-primary/15 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">نصائح لزيادة فرص البيع</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>أضف صورة واضحة للغلاف — الإعلانات بصورة تُباع ٣x أسرع</li>
            <li>اكتب وصفاً دقيقاً لحالة الكتاب لتجنب الخلافات</li>
            <li>فعّل خيار واتساب في ملفك الشخصي لتسهيل التواصل</li>
          </ul>
        </div>
      )}
    </div>
  );
}

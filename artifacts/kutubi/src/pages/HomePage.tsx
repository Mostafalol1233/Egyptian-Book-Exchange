import { useState } from 'react';
import { BookFilters, useBooks } from '@/lib/hooks/useBooks';
import { SearchBar } from '@/components/books/SearchBar';
import { FilterPanel } from '@/components/books/FilterPanel';
import { BookGrid } from '@/components/books/BookGrid';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { ArrowUpDown, BookOpen, Gift, MapPin } from 'lucide-react';
import { Link } from 'wouter';

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث أولاً' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'views', label: 'الأكثر مشاهدة' },
];

export default function HomePage() {
  const [filters, setFilters] = useState<BookFilters>({ sort: 'newest' });

  const { data: books, isLoading } = useBooks(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleFiltersChange = (newFilters: BookFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort: sort as BookFilters['sort'] }));
  };

  const freeCount = books?.filter(b => b.is_free).length ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-teal-50/60 to-background py-12 lg:py-20 border-b border-border overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-primary/20">
            <BookOpen className="w-4 h-4" />
            منصة تبادل الكتب المدرسية في مصر
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            تبادل الكتب المدرسية
            <span className="text-primary"> بسهولة</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            منصة كُتُبي تساعد طلاب الثانوية العامة في مصر على بيع وشراء الكتب المدرسية المستعملة والجديدة بأسعار مناسبة.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar value={filters.search || ''} onChange={handleSearch} />
          </div>

          {/* Quick stats */}
          {!isLoading && books && books.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span><strong className="text-foreground font-bold">{books.length}</strong> كتاب متاح</span>
              </span>
              {freeCount > 0 && (
                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                  <Gift className="w-4 h-4" />
                  <span><strong>{freeCount}</strong> كتاب مجاني</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>جميع محافظات مصر</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner (non-logged-in friendly) */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="font-medium">عندك كتب قديمة؟ بيعها واكسب فلوس أو وزعها مجاناً لوجه الله 🎁</span>
          <Link href="/sell" className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-1.5 rounded-lg transition-colors text-xs flex-shrink-0">
            ابدأ الآن
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <FilterPanel filters={filters} onChange={handleFiltersChange} />
          </aside>

          {/* Book Grid */}
          <div className="flex-1 w-full min-w-0">
            <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-foreground">
                الكتب المتاحة
                {books && !isLoading && (
                  <span className="mr-2 text-sm font-normal text-muted-foreground">({books.length})</span>
                )}
              </h2>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filters.sort || 'newest'}
                  onChange={e => handleSortChange(e.target.value)}
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <BookGrid books={books} isLoading={isLoading} />
          </div>

        </div>
      </section>

      <AIAssistant onFiltersApply={handleFiltersChange} />
    </div>
  );
}

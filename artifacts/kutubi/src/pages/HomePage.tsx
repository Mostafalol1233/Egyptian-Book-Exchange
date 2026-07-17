import { useState } from 'react';
import { BookFilters, useBooks } from '@/lib/hooks/useBooks';
import { SearchBar } from '@/components/books/SearchBar';
import { FilterPanel } from '@/components/books/FilterPanel';
import { BookGrid } from '@/components/books/BookGrid';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function HomePage() {
  const [filters, setFilters] = useState<BookFilters>({});
  
  const { data: books, isLoading } = useBooks(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleFiltersChange = (newFilters: BookFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-12 lg:py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">
            تبادل الكتب المدرسية بسهولة
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            منصة كُتُبي تساعد طلاب الثانوية العامة في مصر على بيع وشراء الكتب المدرسية المستعملة والجديدة بأسعار مناسبة.
          </p>
          <SearchBar value={filters.search || ''} onChange={handleSearch} />
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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                الكتب المتاحة {books && !isLoading ? `(${books.length})` : ''}
              </h2>
            </div>
            <BookGrid books={books} isLoading={isLoading} />
          </div>

        </div>
      </section>

      <AIAssistant onFiltersApply={handleFiltersChange} />
    </div>
  );
}
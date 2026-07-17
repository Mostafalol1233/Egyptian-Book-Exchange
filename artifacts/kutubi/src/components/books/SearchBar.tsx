import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SearchBar({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto flex items-center">
      <div className="absolute right-4 text-muted-foreground pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="ابحث عن كتاب... مثال: معاصر انجليزي لغات في بنها"
        className="w-full pl-24 pr-12 py-4 bg-white dark:bg-card border-2 border-primary/20 focus:border-primary rounded-full shadow-sm outline-none transition-all text-lg font-medium"
      />
      <button 
        type="submit"
        className="absolute left-2 top-2 bottom-2 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-colors"
      >
        بحث
      </button>
    </form>
  );
}

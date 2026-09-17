import { BookFilters } from '@/lib/hooks/useBooks';
import { SUBJECTS, GRADES, TRACKS, PUBLISHERS, CONDITIONS, EGYPT_GOVERNORATES } from '@/lib/utils/arabic';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterPanelProps {
  filters: BookFilters;
  onChange: (filters: BookFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof BookFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({ search: filters.search, sort: filters.sort });
  };

  const hasActiveFilters = Object.keys(filters).filter(k => !['search', 'sort'].includes(k) && (filters as any)[k]).length > 0;

  const governorates = Object.keys(EGYPT_GOVERNORATES);
  const cities = filters.governorate ? EGYPT_GOVERNORATES[filters.governorate] : [];

  const conditionColors: Record<string, string> = {
    'جديد': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'مستعمل بشكل خفيف': 'bg-blue-50 text-blue-700 border-blue-200',
    'مستعمل': 'bg-amber-50 text-amber-700 border-amber-200',
    'قديم': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 bg-card border border-border py-3 px-4 rounded-xl text-foreground font-medium"
        >
          <Filter className="w-5 h-5" />
          تصفية النتائج
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              نشط
            </span>
          )}
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-card border border-border rounded-2xl p-5 sticky top-24`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2 text-foreground">
            <Filter className="w-5 h-5 text-primary" />
            التصنيفات
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> مسح الكل
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Price */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-foreground">السعر</label>
            <div className="flex flex-col gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'paid', label: 'مدفوع (أقل من 100 جنيه)' },
                { value: 'free', label: 'مجاني فقط 🎁' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio" name="price"
                    checked={(!filters.price && opt.value === 'all') || filters.price === opt.value}
                    onChange={() => updateFilter('price', opt.value as any)}
                    className="accent-primary w-4 h-4"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Condition */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-foreground">حالة الكتاب</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('condition', undefined)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${!filters.condition ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}
              >
                الكل
              </button>
              {CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => updateFilter('condition', filters.condition === c ? undefined : c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    filters.condition === c
                      ? 'bg-primary text-primary-foreground border-primary'
                      : `${conditionColors[c] || 'bg-background text-muted-foreground border-border'} hover:opacity-80`
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Grade */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">الصف الدراسي</label>
            <select
              value={filters.grade || ''}
              onChange={e => updateFilter('grade', e.target.value || undefined)}
              className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">الكل</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Track */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">المسار التعليمي</label>
            <select
              value={filters.track || ''}
              onChange={e => updateFilter('track', e.target.value || undefined)}
              className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">الكل</option>
              {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">المادة</label>
            <select
              value={filters.subject || ''}
              onChange={e => updateFilter('subject', e.target.value || undefined)}
              className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">الكل</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Publisher */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">المدرس/الناشر أو السلسلة</label>
            <select
              value={filters.publisher || ''}
              onChange={e => updateFilter('publisher', e.target.value || undefined)}
              className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">الكل</option>
              {PUBLISHERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="h-px bg-border" />

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">المحافظة</label>
            <select
              value={filters.governorate || ''}
              onChange={e => {
                updateFilter('governorate', e.target.value || undefined);
                updateFilter('city', undefined);
              }}
              className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">كل المحافظات</option>
              {governorates.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {filters.governorate && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">المدينة / المنطقة</label>
              <select
                value={filters.city || ''}
                onChange={e => updateFilter('city', e.target.value || undefined)}
                className="w-full bg-background border border-input rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">كل المدن</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

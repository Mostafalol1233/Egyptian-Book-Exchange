import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
  useBookRequests,
  useCreateBookRequest,
  useFulfillRequest,
  useDeleteRequest,
  type RequestFilters,
} from '@/lib/hooks/useBookRequests';
import { SUBJECTS, GRADES, EGYPT_GOVERNORATES, formatArabicDate } from '@/lib/utils/arabic';
import {
  BookOpen, Plus, X, CheckCircle2, Trash2, MapPin, Loader2,
  MessageSquare, Banknote, ChevronDown, Search
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
function toWhatsAppLink(number: string, bookTitle: string) {
  const cleaned = number.replace(/\D/g, '');
  const normalized = cleaned.startsWith('20')
    ? cleaned
    : cleaned.startsWith('0')
    ? '2' + cleaned
    : '20' + cleaned;
  const msg = `مرحباً، رأيت طلبك على كُتُبي للكتاب "${bookTitle}"، عندي هذا الكتاب للبيع. هل ما زلت مهتماً؟`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`;
}

const SUBJECT_COLORS: Record<string, string> = {
  'الفيزياء':           'bg-blue-100 text-blue-700',
  'الكيمياء':           'bg-purple-100 text-purple-700',
  'الأحياء':            'bg-green-100 text-green-700',
  'الجيولوجيا':         'bg-amber-100 text-amber-700',
  'الرياضيات البحتة':   'bg-rose-100 text-rose-700',
  'الرياضيات التطبيقية':'bg-orange-100 text-orange-700',
  'اللغة العربية':      'bg-teal-100 text-teal-700',
  'اللغة الإنجليزية':   'bg-sky-100 text-sky-700',
  'التاريخ':            'bg-yellow-100 text-yellow-700',
  'الجغرافيا':          'bg-lime-100 text-lime-700',
};
function subjectColor(s: string | null) {
  return s ? (SUBJECT_COLORS[s] ?? 'bg-muted text-muted-foreground') : 'bg-muted text-muted-foreground';
}

// ── AddRequestModal ───────────────────────────────────────────────────────────
interface ModalProps { onClose: () => void }

function AddRequestModal({ onClose }: ModalProps) {
  const { user } = useAuth();
  const create = useCreateBookRequest();

  const [title, setTitle]         = useState('');
  const [subject, setSubject]     = useState('');
  const [grade, setGrade]         = useState('');
  const [governorate, setGov]     = useState('');
  const [whatsapp, setWhatsapp]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');
  const [notes, setNotes]         = useState('');
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return; }
    if (!title.trim()) { setError('اسم الكتاب مطلوب'); return; }
    if (!whatsapp.trim()) { setError('رقم الواتساب مطلوب حتى يتواصل معك البائعون'); return; }

    try {
      await create.mutateAsync({
        requester_id: user.id,
        title: title.trim(),
        subject: subject || null,
        grade: grade || null,
        governorate: governorate || null,
        whatsapp: whatsapp.trim(),
        max_price: maxPrice ? Number(maxPrice) : null,
        notes: notes.trim() || null,
        is_fulfilled: false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">طلب كتاب</h2>
            <p className="text-sm text-muted-foreground mt-0.5">أخبر البائعين بالكتاب اللي بتدور عليه</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">اسم الكتاب <span className="text-destructive">*</span></label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="مثال: كتاب المعاصر فيزياء لغات"
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 text-sm"
            />
          </div>

          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">المادة <span className="text-muted-foreground font-normal">(اختياري)</span></label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 py-3 outline-none focus:border-primary text-sm">
                <option value="">كل المواد</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">الصف <span className="text-muted-foreground font-normal">(اختياري)</span></label>
              <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 py-3 outline-none focus:border-primary text-sm">
                <option value="">كل الصفوف</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Governorate + WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">المحافظة <span className="text-muted-foreground font-normal">(اختياري)</span></label>
              <select value={governorate} onChange={e => setGov(e.target.value)} className="w-full bg-background border border-input rounded-xl px-3 py-3 outline-none focus:border-primary text-sm">
                <option value="">كل المحافظات</option>
                {Object.keys(EGYPT_GOVERNORATES).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">رقم الواتساب <span className="text-destructive">*</span></label>
              <input
                type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Max price */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">الحد الأقصى للسعر <span className="text-muted-foreground font-normal">(اختياري، بالجنيه)</span></label>
            <input
              type="number" min="0" max="500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="مثال: 50"
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">ملاحظات إضافية <span className="text-muted-foreground font-normal">(اختياري)</span></label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="مثال: مقبول حتى لو فيه شخبطة بسيطة، أو طبعة 2024 فقط..."
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary text-sm min-h-[80px] resize-y"
            />
          </div>

          <button
            type="submit" disabled={create.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
          >
            {create.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري النشر...</>
              : <><Plus className="w-4 h-4" /> نشر الطلب</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<RequestFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);

  const { data: requests = [], isLoading, isError } = useBookRequests(filters);
  const fulfill = useFulfillRequest();
  const remove  = useDeleteRequest();

  const openModal = () => {
    if (!user) { setAuthPrompt(true); return; }
    setModalOpen(true);
  };

  const toggleFilter = (key: keyof RequestFilters, value: string) => {
    setFilters(f => ({ ...f, [key]: f[key] === value ? undefined : value }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 80% 50%, var(--color-primary) 0%, transparent 60%)'}} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">لوحة الطلبات</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">مش لاقي كتاب؟</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              اكتب اسم الكتاب اللي بتدور عليه، والبائعون اللي عندهم هيتواصلوا معك مباشرةً على الواتساب.
            </p>
            {requests.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                <BookOpen className="w-4 h-4" />
                {requests.length} طلب مفتوح الآن
              </div>
            )}
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 text-sm"
          >
            <Plus className="w-5 h-5" />
            اطلب كتاب
          </button>
        </div>
      </div>

      {/* ── Auth prompt ── */}
      {authPrompt && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-amber-800">يجب تسجيل الدخول لنشر طلب</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setAuthPrompt(false); window.dispatchEvent(new CustomEvent('open-auth-modal')); }}
              className="bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg"
            >تسجيل الدخول</button>
            <button onClick={() => setAuthPrompt(false)} className="text-amber-600 text-sm px-2">×</button>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ChevronDown className="w-4 h-4" />
          فلتر الطلبات
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({})}
              className="mr-auto text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> مسح الفلاتر
            </button>
          )}
        </div>

        {/* Subject pills */}
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => toggleFilter('subject', s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filters.subject === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50 text-foreground'
              }`}
            >{s}</button>
          ))}
        </div>

        {/* Grade + Governorate */}
        <div className="flex flex-wrap gap-2">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => toggleFilter('grade', g)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filters.grade === g
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50 text-foreground'
              }`}
            >{g}</button>
          ))}
          <div className="h-px w-full border-t border-border/60 my-0.5" />
          {Object.keys(EGYPT_GOVERNORATES).map(g => (
            <button
              key={g}
              onClick={() => toggleFilter('governorate', g)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filters.governorate === g
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50 text-foreground'
              }`}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-destructive/5 border border-destructive/20 rounded-2xl">
          <p className="text-destructive font-semibold mb-2">حدث خطأ في تحميل الطلبات</p>
          <p className="text-sm text-muted-foreground">تأكد من إنشاء جدول <code className="bg-muted px-1 rounded">book_requests</code> في Supabase</p>
        </div>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {activeFilterCount > 0 ? 'لا توجد طلبات بهذا الفلتر' : 'لا توجد طلبات بعد'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {activeFilterCount > 0 ? 'جرب تغيير الفلتر' : 'كن أول من يطلب كتاباً ويساعد الجميع'}
          </p>
          <button onClick={openModal} className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> اطلب أول كتاب
          </button>
        </div>
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map(req => {
            const isOwner = user?.id === req.requester_id;
            return (
              <div
                key={req.id}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3 group relative"
              >
                {/* Subject ribbon */}
                {req.subject && (
                  <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full ${subjectColor(req.subject)}`}>
                    {req.subject}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-base font-extrabold text-foreground leading-snug">{req.title}</h3>

                {/* Meta tags */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {req.grade && (
                    <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">{req.grade}</span>
                  )}
                  {req.governorate && (
                    <span className="flex items-center gap-1 bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                      <MapPin className="w-3 h-3" />{req.governorate}
                    </span>
                  )}
                  {req.max_price != null && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium border border-green-200">
                      <Banknote className="w-3 h-3" />حتى {req.max_price} جنيه
                    </span>
                  )}
                </div>

                {/* Notes */}
                {req.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 line-clamp-2">
                    {req.notes}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    {req.profiles?.avatar_url ? (
                      <img src={req.profiles.avatar_url} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {req.profiles?.full_name?.[0] ?? '؟'}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {req.profiles?.full_name ?? 'مستخدم'} · {formatArabicDate(req.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => fulfill.mutate(req.id)}
                          disabled={fulfill.isPending}
                          title="تم العثور عليه"
                          className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          وجدته!
                        </button>
                        <button
                          onClick={() => { if (confirm('حذف هذا الطلب؟')) remove.mutate(req.id); }}
                          disabled={remove.isPending}
                          title="حذف الطلب"
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <a
                        href={toWhatsAppLink(req.whatsapp, req.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        عندي هذا الكتاب!
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && <AddRequestModal onClose={() => setModalOpen(false)} />}

      {/* ── Floating FAB (mobile) ── */}
      {!modalOpen && (
        <button
          onClick={openModal}
          className="fixed bottom-6 left-6 z-30 md:hidden bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
          aria-label="اطلب كتاب"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

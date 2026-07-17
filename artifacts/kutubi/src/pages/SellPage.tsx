import { useState, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCreateBook } from '@/lib/hooks/useBooks';
import { uploadBookImage } from '@/lib/utils/imageUpload';
import { SUBJECTS, GRADES, TRACKS, PUBLISHERS, CONDITIONS, EGYPT_GOVERNORATES } from '@/lib/utils/arabic';
import { useLocation } from 'wouter';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

export default function SellPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createBook = useCreateBook();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [track, setTrack] = useState(TRACKS[0]);
  const [publisher, setPublisher] = useState(PUBLISHERS[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState(EGYPT_GOVERNORATES['القاهرة'][0]);
  const [delivery, setDelivery] = useState<'pickup'|'shipping'>('pickup');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول أولاً</h2>
        <p className="text-muted-foreground mb-6">لا يمكنك عرض كتاب للبيع بدون حساب.</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold">
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericPrice = Number(price);
    if (!isFree && (isNaN(numericPrice) || numericPrice < 0 || numericPrice > 100)) {
      setError('الحد الأقصى للسعر هو 100 جنيه');
      return;
    }

    if (!title.trim()) {
      setError('يرجى إدخال عنوان الكتاب');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadBookImage(imageFile);
      }

      await createBook.mutateAsync({
        seller_id: user.id,
        title: title.trim(),
        subject,
        grade,
        track,
        publisher,
        condition,
        price: isFree ? 0 : numericPrice,
        is_free: isFree,
        image_url: imageUrl,
        description: description.trim(),
        governorate,
        city,
        delivery,
        is_sold: false
      });

      setSuccess(true);
      setTimeout(() => setLocation('/dashboard'), 2000);
      
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الكتاب');
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">تم عرض كتابك بنجاح!</h2>
        <p className="text-muted-foreground">جاري تحويلك إلى لوحة التحكم...</p>
      </div>
    );
  }

  const cities = EGYPT_GOVERNORATES[governorate] || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">عرض كتاب للبيع</h1>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">المعلومات الأساسية</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">عنوان الكتاب (كما هو مكتوب على الغلاف) <span className="text-destructive">*</span></label>
            <input 
              type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="مثال: كتاب المعاصر رياضيات بحتة لغات"
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">المادة <span className="text-destructive">*</span></label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">الصف الدراسي <span className="text-destructive">*</span></label>
              <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">المسار التعليمي <span className="text-destructive">*</span></label>
              <select value={track} onChange={e => setTrack(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">الناشر/السلسلة <span className="text-destructive">*</span></label>
              <select value={publisher} onChange={e => setPublisher(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {PUBLISHERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Condition & Price */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">الحالة والسعر</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">حالة الكتاب <span className="text-destructive">*</span></label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex justify-between">
                <span>السعر (جنيه) <span className="text-destructive">*</span></span>
                <label className="flex items-center gap-1.5 cursor-pointer text-primary">
                  <input 
                    type="checkbox" 
                    checked={isFree} 
                    onChange={e => { setIsFree(e.target.checked); if(e.target.checked) setPrice('0'); else setPrice(''); }}
                    className="accent-primary w-4 h-4"
                  />
                  مجاني لوجه الله
                </label>
              </label>
              <input 
                type="number" min="0" max="100" required={!isFree}
                disabled={isFree}
                value={price} onChange={e => setPrice(e.target.value)}
                placeholder="الحد الأقصى 100 جنيه"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 disabled:opacity-50 disabled:bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Photo & Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">تفاصيل إضافية</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">صورة الغلاف (اختياري، لكن يزيد من فرصة البيع)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary bg-background rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group min-h-[160px]"
            >
              <input 
                type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/jpeg,image/png,image/webp" className="hidden" 
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain bg-black/5" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    تغيير الصورة
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-primary/10 p-4 rounded-full mb-3 text-primary">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-foreground mb-1">اضغط لاختيار صورة</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP حتى 5 ميجابايت</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">وصف إضافي (اختياري)</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="مثال: الكتاب فيه شوية شخبطة رصاص في أول 10 صفحات بس الباقي نظيف..."
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 min-h-[100px] resize-y"
            ></textarea>
          </div>
        </div>

        {/* Section 4: Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">مكان التسليم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">المحافظة <span className="text-destructive">*</span></label>
              <select value={governorate} onChange={e => { setGovernorate(e.target.value); setCity(EGYPT_GOVERNORATES[e.target.value][0]); }} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {Object.keys(EGYPT_GOVERNORATES).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">المدينة/المنطقة <span className="text-destructive">*</span></label>
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">طريقة التسليم <span className="text-destructive">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-xl flex-1 hover:bg-muted bg-background">
                  <input type="radio" name="delivery" checked={delivery === 'pickup'} onChange={() => setDelivery('pickup')} className="accent-primary w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">مقابلة شخصية</span>
                    <span className="text-xs text-muted-foreground">المشتري يجي يستلم</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-xl flex-1 hover:bg-muted bg-background">
                  <input type="radio" name="delivery" checked={delivery === 'shipping'} onChange={() => setDelivery('shipping')} className="accent-primary w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">متاح شحن</span>
                    <span className="text-xs text-muted-foreground">عن طريق البريد مثلاً</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" disabled={isUploading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
          >
            {isUploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
            ) : (
              <><Upload className="w-5 h-5" /> نشر الكتاب</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
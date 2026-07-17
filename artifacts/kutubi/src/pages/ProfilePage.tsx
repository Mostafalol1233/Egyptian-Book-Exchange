import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { EGYPT_GOVERNORATES } from '@/lib/utils/arabic';
import { Loader2, CheckCircle2, User } from 'lucide-react';
import { useLocation } from 'wouter';

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
        
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setGovernorate(data.governorate || '');
        setCity(data.city || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          whatsapp,
          governorate,
          city,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) throw error;
      
      // Update auth metadata if name changed
      await supabase.auth.updateUser({ data: { full_name: fullName } });

      setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء التحديث' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center">جاري التحميل...</div>;
  }

  const governorates = Object.keys(EGYPT_GOVERNORATES);
  const cities = governorate ? EGYPT_GOVERNORATES[governorate] : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الملف الشخصي</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">الاسم الكامل <span className="text-destructive">*</span></label>
            <input 
              type="text" required
              value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">رقم الهاتف <span className="text-muted-foreground font-normal">(يظهر للمشترين)</span></label>
              <input 
                type="tel" dir="ltr"
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 text-left"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">رقم الواتساب <span className="text-muted-foreground font-normal">(يظهر للمشترين)</span></label>
              <input 
                type="tel" dir="ltr"
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">المحافظة (الافتراضية)</label>
              <select 
                value={governorate} 
                onChange={e => { setGovernorate(e.target.value); setCity(''); }}
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1"
              >
                <option value="">اختر المحافظة...</option>
                {governorates.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">المدينة/المنطقة</label>
              <select 
                value={city} onChange={e => setCity(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1"
                disabled={!governorate}
              >
                <option value="">اختر المدينة...</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button 
              type="submit" disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
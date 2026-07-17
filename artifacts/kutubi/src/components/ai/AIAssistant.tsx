import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, WifiOff } from 'lucide-react';
import { BookFilters } from '@/lib/hooks/useBooks';

interface AIAssistantProps {
  onFiltersApply: (filters: BookFilters) => void;
}

// Track quota exhaustion across renders
let quotaExhausted = false;

export function AIAssistant({ onFiltersApply }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content:
        'أهلاً بك في كُتُبي! أنا المساعد الذكي، اخبرني عن الكتاب الذي تبحث عنه وسأضبط الفلاتر لك تلقائياً.\n\nمثال: محتاج كتاب معاصر رياضيات بحتة تانية ثانوي في المنصورة',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(quotaExhausted);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_AI_CHAT_KEY;

      const systemPrompt = `أنت مساعد ذكي لمنصة كُتُبي لبيع وشراء الكتب المدرسية المصرية.
إذا كان المستخدم يحيّيك أو يسألك سؤالاً عاماً، رد عليه بودّ باللهجة المصرية.
إذا كان يبحث عن كتاب، استخرج هذه الحقول (اتركها فارغة لو مش موجودة): { subject, grade, track, publisher, governorate, city }
ثم أجب بجملة قصيرة ودية وأخبره إنك طبّقت الفلاتر.
لو المستخدم بس بيسلّم أو بيتكلم بشكل عام، رد من غير JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
              })),
              {
                role: 'user',
                parts: [
                  {
                    text:
                      userMessage +
                      (userMessage.length > 10
                        ? '\n\nلو بتبحث عن كتاب، حط JSON داخل ```json\n{...}\n``` جنب ردك.'
                        : ''),
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', JSON.stringify(errData));

        // Quota / billing errors — disable permanently this session
        if (response.status === 429 || response.status === 403) {
          quotaExhausted = true;
          setApiUnavailable(true);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content:
                'عذراً، حصة المساعد الذكي انتهت مؤقتاً. استخدم الفلاتر يدوياً من الشريط الجانبي 👈',
            },
          ]);
          return;
        }
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!textResponse) throw new Error('empty response');

      // Extract JSON filters if present
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      let filters: BookFilters = {};

      if (jsonMatch?.[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          Object.keys(parsed).forEach(key => {
            const val = parsed[key];
            if (val && val !== '' && val !== 'null') {
              filters[key as keyof BookFilters] = val;
            }
          });
        } catch (e) {
          console.error('Failed to parse AI JSON', e);
        }
      }

      const cleanResponse = textResponse.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: cleanResponse || 'تم! شايف الكتب المناسبة ليك 👇' },
      ]);

      if (Object.keys(filters).length > 0) {
        onFiltersApply(filters);
      }
    } catch (error: any) {
      console.error('AI error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'عذراً، حصل خطأ. استخدم الفلاتر مباشرة من الشريط الجانبي.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // If API is permanently unavailable this session, show a minimal tooltip button
  if (apiUnavailable) {
    return (
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-full p-4 shadow-md transition-all cursor-default"
          title="المساعد الذكي غير متاح حالياً"
          onClick={() => setIsOpen(v => !v)}
        >
          <WifiOff className="w-6 h-6" />
        </button>
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-64 bg-card border border-border rounded-2xl shadow-xl p-4 text-sm text-center animate-in slide-in-from-bottom-2">
            <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-bold mb-1">المساعد الذكي غير متاح</p>
            <p className="text-muted-foreground text-xs">
              حصة Gemini API انتهت. استخدم الفلاتر يدوياً من الشريط الجانبي.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-transform hover:scale-105 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-primary font-bold py-2 px-4 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          المساعد الذكي 🤖
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold">المساعد الذكي</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary/20 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[350px] p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-white dark:bg-slate-800 border border-border rounded-bl-none text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl rounded-bl-none p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="ابحث عن كتاب..."
              className="flex-grow bg-muted border-none rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-primary text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-primary text-primary-foreground p-2 rounded-xl disabled:opacity-50 transition-colors hover:bg-primary/90"
            >
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

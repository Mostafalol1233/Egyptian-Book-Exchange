import { useAuth } from '@/lib/context/AuthContext';
import { useConversation, useMessages, useSendMessage } from '@/lib/hooks/useChat';
import { formatArabicDate } from '@/lib/utils/arabic';
import { Send, Loader2, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';

// Fire-and-forget: notify the OTHER person in the conversation by email.
// If the API isn't configured, the endpoint returns { ok: false } silently.
function notifyRecipient(payload: {
  recipientId: string;
  senderName: string;
  bookTitle: string;
  messagePreview: string;
  chatUrl: string;
}) {
  fetch('/api/notify-seller', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Completely silent — never block or alert the user
  });
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const { data: conversation, isLoading: convLoading } = useConversation(conversationId);
  const { data: messages, isLoading: msgLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !conversation) return;

    const content = input.trim();
    setInput(''); // clear immediately for snappy UX

    try {
      await sendMessage.mutateAsync({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        is_read: false,
      });

      // Determine who should be notified (the other person in the conversation)
      const recipientId =
        user.id === conversation.buyer_id
          ? conversation.seller_id
          : conversation.buyer_id;

      notifyRecipient({
        recipientId,
        senderName: user.user_metadata?.full_name ?? 'مستخدم',
        bookTitle: conversation.books?.title ?? 'كتاب',
        messagePreview: content.slice(0, 120),
        chatUrl: `${window.location.origin}/chat/${conversationId}`,
      });
    } catch {
      // Restore input if the Supabase insert failed
      setInput(content);
    }
  };

  if (convLoading || msgLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-2xl border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) return null;

  const otherPerson = user?.id === conversation.buyer_id ? conversation.seller : conversation.buyer;

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden">
            {otherPerson?.avatar_url ? (
              <img src={otherPerson.avatar_url} alt={otherPerson.full_name} className="w-full h-full object-cover" />
            ) : (
              otherPerson?.full_name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{otherPerson?.full_name}</h3>
            <span className="text-xs text-muted-foreground">
              {user?.id === conversation.buyer_id ? 'البائع' : 'المشتري'}
            </span>
          </div>
        </div>
        
        {/* Book snippet */}
        <Link href={`/book/${conversation.book_id}`} className="flex items-center gap-2 bg-background border border-border p-2 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
            {conversation.books?.image_url ? (
              <img src={conversation.books.image_url} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-4 h-4 m-2 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs font-semibold max-w-[120px] truncate">{conversation.books?.title}</span>
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/20">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                isMine 
                  ? 'bg-primary text-primary-foreground rounded-bl-none' 
                  : 'bg-white dark:bg-slate-800 border border-border text-foreground rounded-br-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                {formatArabicDate(msg.created_at)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-muted border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary"
        />
        <button 
          type="submit"
          disabled={!input.trim() || sendMessage.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  );
}

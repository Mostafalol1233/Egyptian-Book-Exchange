import { useAuth } from '@/lib/context/AuthContext';
import { useConversations } from '@/lib/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { formatArabicDate } from '@/lib/utils/arabic';
import { MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import { useRoute, useLocation, Redirect } from 'wouter';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: conversations, isLoading } = useConversations(user?.id);
  const [, params] = useRoute('/chat/:id');
  const activeId = params?.id;

  if (loading) return null;
  if (!user) return <Redirect to="/" />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl h-[calc(100vh-4rem)] flex gap-6">
      
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            الرسائل
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">جاري التحميل...</div>
          ) : conversations && conversations.length > 0 ? (
            <div className="divide-y divide-border">
              {conversations.map(conv => {
                const otherPerson = user.id === conv.buyer_id ? conv.seller : conv.buyer;
                const isActive = conv.id === activeId;
                
                return (
                  <button 
                    key={conv.id}
                    onClick={() => setLocation(`/chat/${conv.id}`)}
                    className={`w-full text-right p-4 flex gap-3 transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/5' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold overflow-hidden border border-primary/20">
                      {otherPerson?.avatar_url ? (
                        <img src={otherPerson.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        otherPerson?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-foreground truncate">{otherPerson?.full_name}</span>
                        {conv.latest_message && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap mr-2">
                            {formatArabicDate(conv.latest_message.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-primary font-medium mb-1 truncate">
                        كتاب: {conv.books?.title}
                      </div>
                      {conv.latest_message && (
                        <p className={`text-sm truncate ${!conv.latest_message.is_read && conv.latest_message.sender_id !== user.id ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {conv.latest_message.sender_id === user.id ? 'أنت: ' : ''}
                          {conv.latest_message.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              لا توجد محادثات حتى الآن
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 ${!activeId ? 'hidden md:flex flex-col items-center justify-center bg-card border border-border rounded-2xl text-muted-foreground' : ''}`}>
        {activeId ? (
          <ChatWindow conversationId={activeId} />
        ) : (
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>اختر محادثة للبدء في المراسلة</p>
          </div>
        )}
      </div>

    </div>
  );
}
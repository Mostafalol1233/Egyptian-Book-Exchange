import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useEffect } from 'react';

export interface Conversation {
  id: string;
  book_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  books?: { title: string, image_url: string | null };
  buyer?: { full_name: string, avatar_url: string | null };
  seller?: { full_name: string, avatar_url: string | null };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          books (title, image_url),
          buyer:profiles!buyer_id (full_name, avatar_url),
          seller:profiles!seller_id (full_name, avatar_url),
          messages (content, is_read, created_at, sender_id)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
        
      if (error) throw error;
      
      // Clean up messages array to just the latest one
      return data.map(conv => ({
        ...conv,
        latest_message: conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      }));
    },
    enabled: !!userId
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          books (title, image_url),
          buyer:profiles!buyer_id (full_name, avatar_url),
          seller:profiles!seller_id (full_name, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!id
  });
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        const newMessage = payload.new as Message;
        queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
          if (!old) return [newMessage];
          return [...old, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Mark as read
      supabase.from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .then();
        
      return data as Message[];
    },
    enabled: !!conversationId
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: Partial<Message>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', message.conversation_id);
        
      return data as Message;
    },
    onSuccess: (data, variables) => {
      // Optimistic update handled by realtime
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ book_id, seller_id, buyer_id }: { book_id: string, seller_id: string, buyer_id: string }) => {
      // Check if exists
      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .eq('book_id', book_id)
        .eq('buyer_id', buyer_id)
        .maybeSingle();

      if (existing) return existing.id;

      // Create new
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          book_id,
          seller_id,
          buyer_id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
}
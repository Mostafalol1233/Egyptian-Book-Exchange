import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface BookRequest {
  id: string;
  requester_id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  governorate: string | null;
  whatsapp: string;
  notes: string | null;
  max_price: number | null;
  is_fulfilled: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface RequestFilters {
  subject?: string;
  grade?: string;
  governorate?: string;
}

export function useBookRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ['book_requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('book_requests')
        .select('*, profiles(full_name, avatar_url)')
        .eq('is_fulfilled', false)
        .order('created_at', { ascending: false });

      if (filters.subject) query = query.eq('subject', filters.subject);
      if (filters.grade) query = query.eq('grade', filters.grade);
      if (filters.governorate) query = query.eq('governorate', filters.governorate);

      const { data, error } = await query;
      if (error) throw error;
      return data as BookRequest[];
    }
  });
}

export function useUserBookRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['book_requests', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BookRequest[];
    },
    enabled: !!userId
  });
}

export function useCreateBookRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: Partial<BookRequest>) => {
      const { data, error } = await supabase
        .from('book_requests')
        .insert(req)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_requests'] });
    }
  });
}

export function useFulfillRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('book_requests')
        .update({ is_fulfilled: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_requests'] });
    }
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('book_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book_requests'] });
    }
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { filterFeaturedBooks, getFeaturedBook } from '../featuredBooks';

export interface BookFilters {
  search?: string;
  subject?: string;
  grade?: string;
  track?: string;
  publisher?: string;
  governorate?: string;
  city?: string;
  price?: 'free' | 'paid' | 'all';
  condition?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'views';
}

export interface Book {
  id: string;
  seller_id: string;
  title: string;
  subject: string;
  grade: string;
  track: string;
  publisher: string;
  condition: string;
  price: number;
  is_free: boolean;
  image_url: string | null;
  description: string;
  governorate: string;
  city: string;
  delivery: 'pickup' | 'shipping';
  is_sold: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  is_catalog?: boolean;
  profiles?: {
    full_name: string;
    avatar_url: string;
    governorate: string;
    city: string;
    phone: string;
    whatsapp: string;
  };
}

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*, profiles(full_name, avatar_url, governorate, city, phone, whatsapp)')
        .eq('is_sold', false);

      if (filters.subject) query = query.eq('subject', filters.subject);
      if (filters.grade) query = query.eq('grade', filters.grade);
      if (filters.track) query = query.eq('track', filters.track);
      if (filters.publisher) query = query.eq('publisher', filters.publisher);
      if (filters.governorate) query = query.eq('governorate', filters.governorate);
      if (filters.city) query = query.eq('city', filters.city);
      
      if (filters.price === 'free') query = query.eq('is_free', true);
      else if (filters.price === 'paid') query = query.eq('is_free', false);
      
      if (filters.condition) query = query.eq('condition', filters.condition);
      if (filters.search) {
        const search = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${search},subject.ilike.${search},publisher.ilike.${search}`);
      }

      // Sort
      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (filters.sort === 'views') query = query.order('views_count', { ascending: false });
      else query = query.order('created_at', { ascending: false }); // newest (default)

      const { data, error } = await query;
      if (error) return filterFeaturedBooks(filters);
      const remoteBooks = data as Book[];
      const remoteIds = new Set(remoteBooks.map((book) => book.id));
      return [...filterFeaturedBooks(filters).filter((book) => !remoteIds.has(book.id)), ...remoteBooks];
    }
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const featuredBook = getFeaturedBook(id);
      if (featuredBook) return featuredBook;

      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Increment views count asynchronously
      supabase.rpc('increment_views', { book_id: id }).then();
      
      return data as Book;
    },
    enabled: !!id
  });
}

export function useUserBooks(userId: string | undefined) {
  return useQuery({
    queryKey: ['books', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Book[];
    },
    enabled: !!userId
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (book: Partial<Book>) => {
      const { data, error } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Book> }) => {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });
}

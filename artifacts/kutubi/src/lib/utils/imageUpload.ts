import { supabase } from '../supabase';

export async function uploadBookImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('book-images')
    .upload(fileName, file, { contentType: file.type });
    
  if (error) {
    throw error;
  }
  
  const { data: urlData } = supabase.storage
    .from('book-images')
    .getPublicUrl(data.path);
    
  return urlData.publicUrl;
}

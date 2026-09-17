import type { Book, BookFilters } from './hooks/useBooks';

const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const coverUrl = (filename: string) => storageBaseUrl
  ? `${storageBaseUrl}/storage/v1/object/public/book-images/catalog/${filename}`
  : `/book-covers/${filename}`;

const catalogBook = (book: Omit<Book, 'seller_id' | 'created_at' | 'updated_at' | 'views_count' | 'is_sold' | 'is_free' | 'delivery' | 'governorate' | 'city' | 'condition' | 'price'>): Book => ({
  ...book,
  seller_id: 'catalog',
  created_at: '2026-09-15T00:00:00.000Z',
  updated_at: '2026-09-15T00:00:00.000Z',
  views_count: 0,
  is_sold: false,
  is_free: false,
  delivery: 'shipping',
  governorate: 'مصر',
  city: 'متاح أونلاين',
  condition: 'جديد',
  price: 100,
  is_catalog: true,
});

export const FEATURED_BOOKS: Book[] = [
  catalogBook({ id: 'catalog-mohamed-salah-arabic-explanation', title: 'كتاب الشرح 3 — اللغة العربية', subject: 'اللغة العربية', grade: 'ثالثة ثانوي', track: 'عام عربي', publisher: 'محمد صلاح', image_url: coverUrl('image_1.jpg'), description: 'كتاب الشرح للغة العربية للصف الثالث الثانوي من الأستاذ محمد صلاح.' }),
  catalogBook({ id: 'catalog-joseph-adel-transition-elements', title: 'Transition Elements — Chapter 1', subject: 'الكيمياء', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'جوزيف عادل', image_url: coverUrl('image_2.jpg'), description: 'Class Sheet & Homework Book، الفصل الأول، كيمياء ثالثة ثانوي 2026 — د. جوزيف عادل.' }),
  catalogBook({ id: 'catalog-ahmed-helmy-pure-math', title: 'Pure Math', subject: 'الرياضيات البحتة', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'أحمد حلمي', image_url: coverUrl('image_3.jpg'), description: 'كتاب الرياضيات البحتة للصف الثالث الثانوي من Mr. Ahmed Helmy.' }),
  catalogBook({ id: 'catalog-el-emtehan-arabic', title: 'الامتحان — الأسئلة والتدريبات', subject: 'اللغة العربية', grade: 'ثالثة ثانوي', track: 'عام عربي', publisher: 'الامتحان', image_url: coverUrl('image_4.jpg'), description: 'كتاب الامتحان للأسئلة والتدريبات في اللغة العربية للصف الثالث الثانوي، ويظهر بالصورة الجزآن الأول والثاني.' }),
  catalogBook({ id: 'catalog-ahmed-samir-physics-final-revision', title: 'Physics Final Revision', subject: 'الفيزياء', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'أحمد سمير', image_url: coverUrl('image_5.jpg'), description: 'مراجعة نهائية في الفيزياء للصف الثالث الثانوي 2026 — Mr. Ahmed Samir.' }),
  catalogBook({ id: 'catalog-ahmed-helmy-applied-math', title: 'Applied Math', subject: 'الرياضيات التطبيقية', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'أحمد حلمي', image_url: coverUrl('image_6.jpg'), description: 'كتاب الرياضيات التطبيقية للصف الثالث الثانوي من Mr. Ahmed Helmy.' }),
  catalogBook({ id: 'catalog-el-moasser-chemistry', title: 'El-Moasser Chemistry Main Book', subject: 'الكيمياء', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'المعاصر', image_url: coverUrl('image_7.jpg'), description: 'Main Book كيمياء 2026: الجزء الأول للكيمياء غير العضوية (الفصول 1–4)، والجزء الثاني للكيمياء العضوية (الفصل 5)، مع Open Book Questions.' }),
  catalogBook({ id: 'catalog-el-moasser-pure-math', title: 'El-Moasser Pure Mathematics Collection', subject: 'الرياضيات البحتة', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'المعاصر', image_url: coverUrl('image_8.jpg'), description: 'مجموعة الرياضيات البحتة: Problems وExplanation وGuide Answers وContinuous Revision.' }),
  catalogBook({ id: 'catalog-el-moasser-physics', title: 'El-Moasser Physics Question Book', subject: 'الفيزياء', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'المعاصر', image_url: coverUrl('image_9.jpg'), description: 'Question Book في الفيزياء للصف الثالث الثانوي 2026.' }),
  catalogBook({ id: 'catalog-el-moasser-applied-math', title: 'El-Moasser Applied Mathematics Collection', subject: 'الرياضيات التطبيقية', grade: 'ثالثة ثانوي', track: 'لغات وتجريبي', publisher: 'المعاصر', image_url: coverUrl('image_10.jpg'), description: 'مجموعة الرياضيات التطبيقية: Continuous Revision وProblems وGuide Answers وExplanation.' }),
];

export function filterFeaturedBooks(filters: BookFilters): Book[] {
  const search = filters.search?.trim().toLocaleLowerCase('ar-EG');
  return FEATURED_BOOKS.filter((book) => {
    if (filters.subject && book.subject !== filters.subject) return false;
    if (filters.grade && book.grade !== filters.grade) return false;
    if (filters.track && book.track !== filters.track) return false;
    if (filters.publisher && book.publisher !== filters.publisher) return false;
    if (filters.condition && book.condition !== filters.condition) return false;
    if (filters.price === 'free') return false;
    if (search && ![book.title, book.subject, book.publisher, book.description].some((value) => value.toLocaleLowerCase('ar-EG').includes(search))) return false;
    return true;
  });
}

export function getFeaturedBook(id: string): Book | undefined {
  return FEATURED_BOOKS.find((book) => book.id === id);
}

export const EGYPT_GOVERNORATES: Record<string, string[]> = {
  "القليوبية": ["بنها", "طوخ", "شبرا الخيمة", "القناطر الخيرية", "قليوب", "كفر شكر", "شبين القناطر"],
  "القاهرة": ["هليوبوليس", "مصر الجديدة", "المعادي", "مدينة نصر", "عين شمس", "الزيتون", "التجمع الخامس"],
  "الجيزة": ["الدقي", "المهندسين", "العجوزة", "6 أكتوبر", "الشيخ زايد", "إمبابة"],
  "الإسكندرية": ["المنتزه", "سموحة", "ميامي", "العصافرة", "سيدي بشر", "رشدي"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "منيا القمح", "بلبيس", "أبو حماد"],
  "المنوفية": ["شبين الكوم", "منوف", "أشمون", "تلا", "قويسنا", "الباجور"],
  "الغربية": ["طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات", "قطور"],
  "الدقهلية": ["المنصورة", "ميت غمر", "دكرنس", "طلخا", "السنبلاوين"],
};

export const SUBJECTS = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "اللغة الفرنسية",
  "اللغة الألمانية",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "الجيولوجيا",
  "الرياضيات البحتة",
  "الرياضيات التطبيقية",
  "التاريخ",
  "الجغرافيا",
  "الفلسفة والمنطق",
  "علم النفس والاجتماع"
];

export const GRADES = [
  "أولى ثانوي",
  "ثانية ثانوي",
  "ثالثة ثانوي"
];

export const TRACKS = [
  "عام عربي",
  "لغات وتجريبي"
];

export const PUBLISHERS = [
  "جوزيف عادل",
  "محمد صلاح",
  "أحمد حلمي",
  "أحمد سمير",
  "المعاصر",
  "الكيان",
  "الأضواء",
  "الامتحان",
  "نيوتن",
  "الحديث",
  "المتميز",
  "التفوق",
  "أخرى"
];

export const CONDITIONS = [
  "جديد",
  "مستعمل بشكل خفيف",
  "مستعمل",
  "قديم"
];

export function formatArabicDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "منذ لحظات";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return "منذ دقيقة";
  if (diffInMinutes === 2) return "منذ دقيقتين";
  if (diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`;
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "منذ ساعة";
  if (diffInHours === 2) return "منذ ساعتين";
  if (diffInHours <= 10) return `منذ ${diffInHours} ساعات`;
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "منذ يوم";
  if (diffInDays === 2) return "منذ يومين";
  if (diffInDays <= 10) return `منذ ${diffInDays} أيام`;
  if (diffInDays < 30) return `منذ ${diffInDays} يوم`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "منذ شهر";
  if (diffInMonths === 2) return "منذ شهرين";
  if (diffInMonths <= 10) return `منذ ${diffInMonths} أشهر`;
  
  return date.toLocaleDateString('ar-EG');
}

export function formatPrice(price: number, isFree: boolean): string {
  if (isFree) return "مجاني";
  return `${price} جنيه`;
}

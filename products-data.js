const products = [
  { id: 1, name: "کفش ورزشی نایک ایرمکس", category: "کفش", price: 3600000, image: "👟", description: "کفش ورزشی اصل با کفی نرم و طراحی مدرن.", badge: "٪۲۵" },
  { id: 2, name: "مانتو بلند زنانه زارا", category: "پوشاک", price: 2150000, image: "👗", description: "مانتو بلند و شیک با پارچه باکیفیت.", badge: "جدید" },
  { id: 3, name: "هدفون بی‌سیم سونی XM5", category: "الکترونیک", price: 9900000, image: "🎧", description: "هدفون نویزکنسلینگ حرفه‌ای با باتری ۳۰ ساعته.", badge: null },
  { id: 4, name: "کیف دوشی چرمی", category: "اکسسوری", price: 756000, image: "👜", description: "کیف دوشی زنانه با دوام بالا و طراحی مینیمال.", badge: "٪۱۵" },
  { id: 5, name: "ست لباس راحتی مردانه", category: "پوشاک", price: 1240000, image: "👕", description: "ست راحتی نخی نرم و سبک.", badge: null },
  { id: 6, name: "ساعت هوشمند گلکسی واچ", category: "الکترونیک", price: 7800000, image: "⌚", description: "ساعت هوشمند با مانیتورینگ سلامت و GPS.", badge: "جدید" },
  { id: 7, name: "کاپشن زمستانی مردانه", category: "پوشاک", price: 2750000, image: "🧥", description: "کاپشن گرم و ضدآب با طراحی مدرن.", badge: null },
  { id: 8, name: "ست آرایشی لوکس", category: "زیبایی", price: 3920000, image: "💄", description: "ست کامل آرایشی از برند معتبر.", badge: "٪۳۰" },
  { id: 9, name: "عینک آفتابی پولاریزه", category: "اکسسوری", price: 980000, image: "🕶️", description: "عینک آفتابی با لنز پولاریزه.", badge: null },
  { id: 10, name: "کوله پشتی لپ‌تاپ", category: "اکسسوری", price: 1450000, image: "🎒", description: "کوله ضدآب با محفظه لپ‌تاپ ۱۵ اینچ.", badge: "٪۱۰" },
  { id: 11, name: "کفش رسمی چرم", category: "کفش", price: 2890000, image: "👞", description: "کفش رسمی مردانه از چرم طبیعی.", badge: null },
  { id: 12, name: "اسپیکر بلوتوث قابل حمل", category: "الکترونیک", price: 1850000, image: "🔊", description: "اسپیکر بلوتوث ضدآب با باس قوی.", badge: "جدید" },
  { id: 13, name: "تی‌شرت زارا مردانه", category: "پوشاک", price: 890000, image: "👔", description: "تی‌شرت نخی اصل زارا.", badge: "جدید" },
  { id: 14, name: "کفش زنانه شین", category: "کفش", price: 1120000, image: "👠", description: "کفش پاشنه‌دار شیک مناسب مهمانی.", badge: "٪۲۰" },
  { id: 15, name: "هدفون ایرپادز پرو", category: "الکترونیک", price: 8500000, image: "🎵", description: "هندزفری بی‌سیم با نویزکنسلینگ.", badge: null },
  { id: 16, name: "کرم مرطوب‌کننده", category: "زیبایی", price: 650000, image: "🧴", description: "کرم صورت آبرسان مناسب پوست خشک.", badge: "٪۱۰" }
];
const collections = [
  { id: 1, title: "مجموعه پاییزه", subtitle: "گرم و شیک برای فصل سرد", description: "پوشاک و اکسسوری مناسب پاییز و زمستان.", icon: "🍂", products: [2, 7, 5, 11] },
  { id: 2, title: "تکنولوژی روز", subtitle: "گجت‌های هوشمند", description: "محصولات الکترونیکی از برندهای معتبر.", icon: "⚡", products: [3, 6, 12, 15] }
];
const categories = ["همه", "پوشاک", "کفش", "الکترونیک", "اکسسوری", "زیبایی"];

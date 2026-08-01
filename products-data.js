const products = [
  { id: 1, name: "کفش ورزشی نایک ایرمکس", category: "کفش", price: 3600000, image: "👟", description: "کفش ورزشی اصل با کفی نرم و طراحی مدرن مناسب استفاده روزمره و ورزشی.", badge: "٪۲۵", store: "amazon" },
  { id: 2, name: "مانتو بلند زنانه زارا", category: "پوشاک", price: 2150000, image: "👗", description: "مانتو بلند و شیک با پارچه باکیفیت، مناسب فصل پاییز و زمستان.", badge: "جدید", store: "zara" },
  { id: 3, name: "هدفون بی‌سیم سونی XM5", category: "الکترونیک", price: 9900000, image: "🎧", description: "هدفون نویزکنسلینگ حرفه‌ای با باتری ۳۰ ساعته و صدای استودیویی.", badge: null, store: "amazon" },
  { id: 4, name: "کیف دوشی چرمی", category: "اکسسوری", price: 756000, image: "👜", description: "کیف دوشی زنانه از چرم مصنوعی با دوام بالا و طراحی مینیمال.", badge: "٪۱۵", store: "trendyol" },
  { id: 5, name: "ست لباس راحتی مردانه", category: "پوشاک", price: 1240000, image: "👕", description: "ست راحتی نخی نرم و سبک برای منزل و سفر.", badge: null, store: "lcw" },
  { id: 6, name: "ساعت هوشمند گلکسی واچ", category: "الکترونیک", price: 7800000, image: "⌚", description: "ساعت هوشمند با مانیتورینگ سلامت، GPS و باتری دو روزه.", badge: "جدید", store: "amazon" },
  { id: 7, name: "کاپشن زمستانی مردانه", category: "پوشاک", price: 2750000, image: "🧥", description: "کاپشن گرم و ضدآب با طراحی مدرن مناسب زمستان.", badge: null, store: "defacto" },
  { id: 8, name: "ست آرایشی لوکس", category: "زیبایی", price: 3920000, image: "💄", description: "ست کامل آرایشی از برند معتبر با ماندگاری بالا.", badge: "٪۳۰", store: "namshi" },
  { id: 9, name: "عینک آفتابی پولاریزه", category: "اکسسوری", price: 980000, image: "🕶️", description: "عینک آفتابی با لنز پولاریزه و فریم سبک.", badge: null, store: "shein" },
  { id: 10, name: "کوله پشتی لپ‌تاپ", category: "اکسسوری", price: 1450000, image: "🎒", description: "کوله ضدآب با محفظه لپ‌تاپ ۱۵ اینچ و جیب‌های متعدد.", badge: "٪۱۰", store: "amazon" },
  { id: 11, name: "کفش رسمی چرم", category: "کفش", price: 2890000, image: "👞", description: "کفش رسمی مردانه از چرم طبیعی با کفی راحت.", badge: null, store: "boyner" },
  { id: 12, name: "اسپیکر بلوتوث قابل حمل", category: "الکترونیک", price: 1850000, image: "🔊", description: "اسپیکر بلوتوث ضدآب با باس قوی و باتری ۱۲ ساعته.", badge: "جدید", store: "amazon" },
  { id: 13, name: "تی‌شرت زارا مردانه", category: "پوشاک", price: 890000, image: "👔", description: "تی‌شرت نخی اصل زارا با برش استاندارد.", badge: "جدید", store: "zara" },
  { id: 14, name: "کفش زنانه شین", category: "کفش", price: 1120000, image: "👠", description: "کفش پاشنه‌دار شیک مناسب مهمانی و استفاده روزمره.", badge: "٪۲۰", store: "shein" },
  { id: 15, name: "هدفون ایرپادز پرو", category: "الکترونیک", price: 8500000, image: "🎵", description: "هندزفری بی‌سیم با نویزکنسلینگ فعال و شارژ کیس.", badge: null, store: "amazon" },
  { id: 16, name: "کرم مرطوب‌کننده", category: "زیبایی", price: 650000, image: "🧴", description: "کرم صورت آبرسان مناسب پوست خشک و حساس.", badge: "٪۱۰", store: "noon" },
  { id: 17, name: "شلوار جین کوتون", category: "پوشاک", price: 1580000, image: "👖", description: "جین باکیفیت با برش مدرن و رنگ پایدار.", badge: null, store: "koton" },
  { id: 18, name: "عطر مردانه", category: "زیبایی", price: 3200000, image: "🧴", description: "عطر اورجینال با پخش بو بالا و ماندگاری طولانی.", badge: "جدید", store: "namshi" },
  { id: 19, name: "کیف پول چرمی", category: "اکسسوری", price: 620000, image: "👛", description: "کیف پول جمع‌وجور با جای کارت و اسکناس.", badge: null, store: "trendyol" },
  { id: 20, name: "کفش رانینگ آدیداس", category: "کفش", price: 4100000, image: "🏃", description: "کفش دویدن سبک با کفی واکنش‌پذیر.", badge: "٪۱۵", store: "amazon" }
];
const collections = [
  { id: 1, title: "مجموعه پاییزه", subtitle: "گرم و شیک برای فصل سرد", description: "پوشاک و اکسسوری مناسب پاییز و زمستان از برندهای معتبر.", icon: "🍂", products: [2, 7, 5, 11, 17] },
  { id: 2, title: "تکنولوژی روز", subtitle: "گجت‌های هوشمند", description: "محصولات الکترونیکی اصل از فروشگاه‌های معتبر جهانی.", icon: "⚡", products: [3, 6, 12, 15] },
  { id: 3, title: "زیبایی و مراقبت", subtitle: "آرایشی و بهداشتی", description: "محصولات زیبایی از نامشی، نون و برندهای لوکس.", icon: "✨", products: [8, 16, 18] }
];
const categories = ["همه", "پوشاک", "کفش", "الکترونیک", "اکسسوری", "زیبایی"];

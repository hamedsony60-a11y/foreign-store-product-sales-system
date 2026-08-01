const products = [
  { id: 1, name: "کفش ورزشی نایک ایرمکس", category: "کفش", price: 3600000, image: "👟", description: "کفش ورزشی اصل با کفی نرم و طراحی مدرن مناسب استفاده روزمره و ورزشی.", badge: "٪۲۵" },
  { id: 2, name: "مانتو بلند زنانه زارا", category: "پوشاک", price: 2150000, image: "👗", description: "مانتو بلند و شیک با پارچه باکیفیت، مناسب فصل پاییز و زمستان.", badge: "جدید" },
  { id: 3, name: "هدفون بی‌سیم سونی XM5", category: "الکترونیک", price: 9900000, image: "🎧", description: "هدفون نویزکنسلینگ حرفه‌ای با باتری ۳۰ ساعته و صدای استودیویی.", badge: null },
  { id: 4, name: "کیف دوشی چرمی", category: "اکسسوری", price: 756000, image: "👜", description: "کیف دوشی زنانه از چرم مصنوعی با دوام بالا و طراحی مینیمال.", badge: "٪۱۵" },
  { id: 5, name: "ست لباس راحتی مردانه", category: "پوشاک", price: 1240000, image: "👕", description: "ست راحتی نخی نرم و سبک، مناسب استفاده خانگی و خواب.", badge: null },
  { id: 6, name: "ساعت هوشمند گلکسی واچ", category: "الکترونیک", price: 7800000, image: "⌚", description: "ساعت هوشمند با مانیتورینگ سلامت، GPS و عمر باتری طولانی.", badge: "جدید" },
  { id: 7, name: "کاپشن زمستانی مردانه", category: "پوشاک", price: 2750000, image: "🧥", description: "کاپشن گرم و ضدآب با طراحی مدرن، مناسب فصل سرد.", badge: null },
  { id: 8, name: "ست آرایشی لوکس", category: "زیبایی", price: 3920000, image: "💄", description: "ست کامل آرایشی شامل رژ لب، کرم پودر و سایه چشم از برند معتبر.", badge: "٪۳۰" },
  { id: 9, name: "عینک آفتابی پولاریزه", category: "اکسسوری", price: 980000, image: "🕶️", description: "عینک آفتابی با لنز پولاریزه و فریم سبک فلزی.", badge: null },
  { id: 10, name: "کوله پشتی لپ‌تاپ", category: "اکسسوری", price: 1450000, image: "🎒", description: "کوله ضدآب با محفظه لپ‌تاپ ۱۵ اینچ و طراحی ارگونومیک.", badge: "٪۱۰" },
  { id: 11, name: "کفش رسمی چرم", category: "کفش", price: 2890000, image: "👞", description: "کفش رسمی مردانه از چرم طبیعی با دوخت دست و کفی راحت.", badge: null },
  { id: 12, name: "اسپیکر بلوتوث قابل حمل", category: "الکترونیک", price: 1850000, image: "🔊", description: "اسپیکر بلوتوث ضدآب با باس قدرتمند و باتری ۱۲ ساعته.", badge: "جدید" },
  { id: 13, name: "تی‌شرت زارا مردانه", category: "پوشاک", price: 890000, image: "👔", description: "تی‌شرت نخی اصل زارا با برش مدرن.", badge: "جدید" },
  { id: 14, name: "کفش زنانه شین", category: "کفش", price: 1120000, image: "👠", description: "کفش پاشنه‌دار شیک مناسب مهمانی.", badge: "٪۲۰" },
  { id: 15, name: "هدفون ایرپادز پرو", category: "الکترونیک", price: 8500000, image: "🎵", description: "هندزفری بی‌سیم با نویزکنسلینگ فعال.", badge: null },
  { id: 16, name: "کرم مرطوب‌کننده", category: "زیبایی", price: 650000, image: "🧴", description: "کرم صورت آبرسان مناسب پوست خشک.", badge: "٪۱۰" }
];

const collections = [
  { id: 1, title: "مجموعه پاییزه", subtitle: "گرم و شیک برای فصل سرد", description: "انتخابی از پوشاک و اکسسوری‌های مناسب پاییز و زمستان.", icon: "🍂", products: [2, 7, 5, 11] },
  { id: 2, title: "تکنولوژی روز", subtitle: "جدیدترین گجت‌های هوشمند", description: "محصولات الکترونیکی منتخب از برندهای معتبر.", icon: "⚡", products: [3, 6, 12, 15] }
];

const categories = ["همه", "پوشاک", "کفش", "الکترونیک", "اکسسوری", "زیبایی"];

/* نمایش خودکار محصولات */
(function () {
  function fmt(n) {
    try { return Math.round(n).toLocaleString('fa-IR') + ' تومان'; } catch (e) { return n + ' تومان'; }
  }
  function card(p) {
    var badge = p.badge ? '<span class="product-badge' + (p.badge === 'جدید' ? ' new' : '') + '">' + p.badge + '</span>' : '';
    return '<div class="product-card" onclick="typeof openModal===\'function\'&&openModal(' + p.id + ')">' +
      '<div class="product-img-wrap"><div class="product-img">' + p.image + '</div>' + badge + '</div>' +
      '<div class="product-body">' +
      '<div class="product-cat">' + p.category + '</div>' +
      '<div class="product-name">' + p.name + '</div>' +
      '<div class="product-footer">' +
      '<div class="product-price">' + fmt(p.price) + '</div>' +
      '<button class="btn-add" type="button" onclick="event.stopPropagation();typeof addToCart===\'function\'&&addToCart(' + p.id + ')">+</button>' +
      '</div></div></div>';
  }
  function fill(id, list) {
    var el = document.getElementById(id);
    if (!el || !list || !list.length) return;
    el.innerHTML = list.map(card).join('');
  }
  function run() {
    if (typeof products === 'undefined') return;
    fill('featuredProducts', products.slice(0, 8));
    fill('productsGrid', products);
    var cg = document.getElementById('categoryGrid');
    if (cg && typeof categories !== 'undefined') {
      var icons = { 'پوشاک': '👗', 'کفش': '👟', 'الکترونیک': '🎧', 'اکسسوری': '👜', 'زیبایی': '💄' };
      cg.innerHTML = categories.filter(function (c) { return c !== 'همه'; }).map(function (c) {
        return '<a href="products.html?cat=' + encodeURIComponent(c) + '" class="cat-card"><div class="cat-icon">' +
          (icons[c] || '📦') + '</div><div class="cat-name">' + c + '</div></a>';
      }).join('');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 400);
})();

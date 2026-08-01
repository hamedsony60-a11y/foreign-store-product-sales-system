/* Site-wide 20-page navigation */
(function () {
  var MAIN = [
    ['index.html', 'خانه'],
    ['products.html', 'محصولات'],
    ['collections.html', 'مجموعه‌ها'],
    ['stores.html', 'فروشگاه‌ها'],
    ['calculator.html', 'محاسبه قیمت'],
    ['contact.html', 'تماس']
  ];
  var ALL = [
    ['index.html', 'خانه'],
    ['products.html', 'محصولات'],
    ['collections.html', 'مجموعه‌ها'],
    ['contact.html', 'تماس'],
    ['about.html', 'درباره ما'],
    ['how-it-works.html', 'نحوه سفارش'],
    ['shipping.html', 'ارسال'],
    ['calculator.html', 'محاسبه قیمت'],
    ['faq.html', 'سوالات متداول'],
    ['terms.html', 'قوانین'],
    ['privacy.html', 'حریم خصوصی'],
    ['stores.html', 'فروشگاه‌ها'],
    ['track-order.html', 'پیگیری سفارش'],
    ['payment.html', 'پرداخت'],
    ['offers.html', 'تخفیف‌ها'],
    ['support.html', 'پشتیبانی'],
    ['blog.html', 'بلاگ'],
    ['account.html', 'حساب کاربری'],
    ['checkout.html', 'تسویه حساب'],
    ['brands.html', 'برندها']
  ];

  function currentFile() {
    var p = (location.pathname || '').split('/').pop() || 'index.html';
    if (!p || p === '') p = 'index.html';
    return p;
  }

  function enhanceNav() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var cur = currentFile();
    nav.innerHTML = MAIN.map(function (item) {
      var cls = item[0] === cur ? ' class="active"' : '';
      return '<a href="' + item[0] + '"' + cls + '>' + item[1] + '</a>';
    }).join('');
  }

  function enhanceFooter() {
    var footer = document.querySelector('.footer');
    if (!footer) return;
    var links = ALL.map(function (item) {
      return '<a href="' + item[0] + '">' + item[1] + '</a>';
    }).join('');
    footer.innerHTML =
      '<div class="footer-links">' + links + '</div>' +
      '<p>© ۱۴۰۵ فروشگاه · خرید از فروشگاه‌های خارجی · ۲۰ صفحه فعال</p>';
  }

  function run() {
    enhanceNav();
    enhanceFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

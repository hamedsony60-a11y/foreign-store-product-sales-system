/* Navigation + inject CSS/fonts site-wide */
(function () {
  function injectCss(href, id) {
    if (document.getElementById(id)) return;
    var l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  // فونت فارسی پایدار (jsDelivr) — قبل از بقیه
  injectCss('fonts.css', 'fonts-css');
  injectCss('styles-ui.css', 'styles-ui');
  injectCss('ux.css', 'ux-css');

  var MAIN = [
    ['index.html', 'خانه'],
    ['products.html', 'محصولات'],
    ['calculator.html', 'سفارش'],
    ['account.html', 'حساب من'],
    ['support.html', 'پشتیبانی']
  ];

  var FOOTER_GROUPS = [
    {
      title: 'فروشگاه',
      links: [
        ['index.html', 'خانه'],
        ['products.html', 'محصولات'],
        ['collections.html', 'مجموعه‌ها'],
        ['brands.html', 'برندها'],
        ['offers.html', 'تخفیف‌ها']
      ]
    },
    {
      title: 'سفارش',
      links: [
        ['calculator.html', 'محاسبه قیمت'],
        ['how-it-works.html', 'نحوه کار'],
        ['shipping.html', 'ارسال'],
        ['track-order.html', 'پیگیری'],
        ['checkout.html', 'تسویه حساب']
      ]
    },
    {
      title: 'راهنما',
      links: [
        ['faq.html', 'سوالات متداول'],
        ['support.html', 'پشتیبانی'],
        ['contact.html', 'تماس'],
        ['about.html', 'درباره ما'],
        ['blog.html', 'بلاگ']
      ]
    },
    {
      title: 'قوانین',
      links: [
        ['terms.html', 'قوانین'],
        ['privacy.html', 'حریم خصوصی'],
        ['payment.html', 'پرداخت'],
        ['account.html', 'حساب کاربری']
      ]
    }
  ];

  function currentFile() {
    var p = (location.pathname || '').split('/').pop() || 'index.html';
    if (!p) p = 'index.html';
    if (p === 'stores.html') p = 'calculator.html';
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
    var html = '<div class="footer-grid">';
    FOOTER_GROUPS.forEach(function (g) {
      html += '<div class="footer-col"><h4>' + g.title + '</h4>';
      g.links.forEach(function (item) {
        html += '<a href="' + item[0] + '">' + item[1] + '</a>';
      });
      html += '</div>';
    });
    html += '</div><p class="footer-copy">© ۱۴۰۵ فروشگاه · خرید از فروشگاه‌های خارجی</p>';
    footer.innerHTML = html;
  }

  function run() {
    enhanceNav();
    enhanceFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

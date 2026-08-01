/* Core scripts loader — restores full shop logic */
(function () {
  function load(src, next) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = next || function () {};
    s.onerror = function () { console.error('Failed to load', src); };
    document.head.appendChild(s);
  }
  load(
    'https://cdn.jsdelivr.net/gh/hamedsony60-a11y/foreign-store-product-sales-system@301eedca64e882e1b2c0f58b83b8eb3a93322801/script.js',
    function () {
      load('payment.js', function () {
        var page = document.body && document.body.dataset.page;
        if (page === 'checkout' && typeof renderCheckoutSummary === 'function') {
          renderCheckoutSummary();
        }
        if (page === 'calculator') {
          if (typeof showInstantRate === 'function') showInstantRate();
          if (typeof fetchUsdRate === 'function') fetchUsdRate();
        }
      });
    }
  );
})();

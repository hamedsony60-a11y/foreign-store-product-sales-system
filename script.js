/* Solid shop loader — safe async load + re-init */
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('load failed: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function runCoreInit() {
    if (typeof clearBadCache === 'function') clearBadCache();
    if (typeof updateCartUI === 'function') updateCartUI();

    var page = document.body && document.body.dataset.page;
    if (page === 'home') {
      if (typeof renderCategories === 'function') renderCategories();
      if (typeof renderFeatured === 'function') renderFeatured();
      if (typeof showInstantRate === 'function') showInstantRate();
      if (typeof fetchUsdRate === 'function') {
        fetchUsdRate();
        setInterval(fetchUsdRate, 5 * 60 * 1000);
      }
    } else if (page === 'products') {
      if (typeof initProductsPage === 'function') initProductsPage();
    } else if (page === 'collections') {
      if (typeof initCollectionsPage === 'function') initCollectionsPage();
    } else if (page === 'checkout') {
      if (typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
    } else if (page === 'calculator') {
      if (typeof showInstantRate === 'function') showInstantRate();
      if (typeof fetchUsdRate === 'function') fetchUsdRate();
    }

    document.addEventListener('click', function (e) {
      var wrap = document.querySelector('.search-wrap');
      var input = document.getElementById('headerSearch');
      if (wrap && input && input.classList.contains('open') && !wrap.contains(e.target)) {
        input.classList.remove('open');
        input.value = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (typeof closeModal === 'function') closeModal();
        if (typeof closeCart === 'function') closeCart();
      }
    });
  }

  var CORE = 'https://cdn.jsdelivr.net/gh/hamedsony60-a11y/foreign-store-product-sales-system@301eedca64e882e1b2c0f58b83b8eb3a93322801/script.js';

  loadScript(CORE)
    .then(function () { return loadScript('payment.js'); })
    .then(function () { runCoreInit(); })
    .catch(function (err) {
      console.error(err);
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 20px;border-radius:999px;z-index:9999;font-family:Vazirmatn,sans-serif;font-size:14px';
      t.textContent = 'خطا در بارگذاری اسکریپت — صفحه را رفرش کنید';
      document.body.appendChild(t);
    });
})();

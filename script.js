/* Solid shop loader */
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function init() {
    try {
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
      } else if (page === 'products' && typeof initProductsPage === 'function') {
        initProductsPage();
      } else if (page === 'collections' && typeof initCollectionsPage === 'function') {
        initCollectionsPage();
      } else if (page === 'checkout' && typeof renderCheckoutSummary === 'function') {
        renderCheckoutSummary();
      } else if (page === 'calculator') {
        if (typeof showInstantRate === 'function') showInstantRate();
        if (typeof fetchUsdRate === 'function') fetchUsdRate();
      }
    } catch (e) { console.error(e); }
  }
  var CORE = 'https://cdn.jsdelivr.net/gh/hamedsony60-a11y/foreign-store-product-sales-system@301eedca64e882e1b2c0f58b83b8eb3a93322801/script.js';
  loadScript(CORE)
    .then(function () { return loadScript('payment.js'); })
    .then(init)
    .catch(function (e) { console.error(e); init(); });
})();

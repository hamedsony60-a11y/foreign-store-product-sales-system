/* Header search — works site-wide */
(function () {
  function goSearch(q) {
    q = (q || '').trim();
    if (!q) {
      if (typeof showToast === 'function') showToast('عبارت جستجو را بنویسید');
      return;
    }
    window.location.href = 'products.html?q=' + encodeURIComponent(q);
  }

  function bindSearch() {
    var input = document.getElementById('headerSearch');
    var btn = document.querySelector('.search-wrap .icon-btn');
    if (!input) return;

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        goSearch(input.value);
      }
    });

    if (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!input.classList.contains('open')) {
          input.classList.add('open');
          setTimeout(function () { input.focus(); }, 50);
          return;
        }
        if (input.value.trim()) goSearch(input.value);
        else input.classList.remove('open');
      };
    }

    document.addEventListener('click', function (e) {
      var wrap = document.querySelector('.search-wrap');
      if (!wrap || !input.classList.contains('open')) return;
      if (!wrap.contains(e.target)) input.classList.remove('open');
    });
  }

  function applyQueryOnProducts() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) return;

    // products page filter
    try {
      if (typeof searchQuery !== 'undefined') searchQuery = q;
      var searchEl = document.getElementById('productSearch');
      if (searchEl) {
        searchEl.value = q;
        searchEl.dispatchEvent(new Event('input'));
      }
      if (typeof applyFilters === 'function') applyFilters();
    } catch (err) {}

    var header = document.getElementById('headerSearch');
    if (header) {
      header.classList.add('open');
      header.value = q;
    }
  }

  function run() {
    bindSearch();
    // wait for shop2 boot
    setTimeout(applyQueryOnProducts, 100);
    setTimeout(applyQueryOnProducts, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

function toggleSearch() {
  var input = document.getElementById('headerSearch');
  if (!input) return;
  if (!input.classList.contains('open')) {
    input.classList.add('open');
    setTimeout(function () { input.focus(); }, 50);
  } else if (input.value.trim()) {
    window.location.href = 'products.html?q=' + encodeURIComponent(input.value.trim());
  } else {
    input.classList.remove('open');
  }
}

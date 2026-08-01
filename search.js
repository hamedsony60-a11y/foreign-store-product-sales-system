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

    // Enter key
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        goSearch(input.value);
      }
    });

    // Click magnifier: if closed → open; if open with text → search; if open empty → close
    if (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!input.classList.contains('open')) {
          input.classList.add('open');
          input.focus();
          return;
        }
        if (input.value.trim()) {
          goSearch(input.value);
        } else {
          input.classList.remove('open');
        }
      };
    }

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      var wrap = document.querySelector('.search-wrap');
      if (!wrap || !input.classList.contains('open')) return;
      if (!wrap.contains(e.target)) {
        input.classList.remove('open');
      }
    });
  }

  // products page: apply ?q=
  function applyQueryOnProducts() {
    if (!document.body || document.body.dataset.page !== 'products') return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) return;
    var searchEl = document.getElementById('productSearch');
    if (searchEl) {
      searchEl.value = q;
      if (typeof searchQuery !== 'undefined') searchQuery = q;
      if (typeof applyFilters === 'function') applyFilters();
    }
    var header = document.getElementById('headerSearch');
    if (header) {
      header.classList.add('open');
      header.value = q;
    }
  }

  function run() {
    bindSearch();
    setTimeout(applyQueryOnProducts, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

// keep global for old onclick
function toggleSearch() {
  var input = document.getElementById('headerSearch');
  if (!input) return;
  if (!input.classList.contains('open')) {
    input.classList.add('open');
    input.focus();
  } else if (input.value.trim()) {
    window.location.href = 'products.html?q=' + encodeURIComponent(input.value.trim());
  } else {
    input.classList.remove('open');
  }
}

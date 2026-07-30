/* ========== CART (localStorage) ========== */
let cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');

function saveCart() {
  localStorage.setItem('shop_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, qty = 1) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  saveCart();
  showToast('به سبد خرید اضافه شد');
  bumpTotal();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
  bumpTotal();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function formatPrice(n) {
  return Math.round(n).toLocaleString('fa-IR') + ' تومان';
}

function updateCartUI() {
  const count = getCartCount();
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
  const container = document.getElementById('cartItems');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><p>سبد خرید خالی است</p></div>`;
    return;
  }
  container.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    return `<div class="cart-item">
      <div class="cart-item-img">${p.image}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${formatPrice(p.price)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart(${p.id})">حذف</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function bumpTotal() {
  const row = document.getElementById('cartTotalRow');
  if (!row) return;
  row.classList.remove('bump');
  void row.offsetWidth;
  row.classList.add('bump');
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  updateCartUI();
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}

function toggleSearch() {
  const input = document.getElementById('headerSearch');
  input.classList.toggle('open');
  if (input.classList.contains('open')) input.focus();
  else input.value = '';
}

function toggleMenu() {
  document.getElementById('mainNav').classList.toggle('mobile-open');
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2000);
}

function productCardHTML(p) {
  const badgeClass = p.badge === 'جدید' ? 'new' : '';
  const badgeHTML = p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : '';
  return `<div class="product-card" onclick="openModal(${p.id})">
    <div class="product-img-wrap"><div class="product-img">${p.image}</div>${badgeHTML}</div>
    <div class="product-body">
      <div class="product-cat">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-footer">
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="btn-add" onclick="event.stopPropagation(); addToCart(${p.id})">+</button>
      </div>
    </div>
  </div>`;
}

function openModal(id) {
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('modalImg').textContent = p.image;
  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.description;
  document.getElementById('modalPrice').textContent = formatPrice(p.price);
  document.getElementById('modalAddBtn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function renderProducts(list, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="no-results">محصولی یافت نشد</div>';
    return;
  }
  el.innerHTML = list.map(productCardHTML).join('');
}

function renderFeatured() {
  renderProducts(products.slice(0, 4), 'featuredProducts');
}

function renderCategories() {
  const icons = { 'پوشاک': '👗', 'کفش': '👟', 'الکترونیک': '🎧', 'اکسسوری': '👜', 'زیبایی': '💄' };
  const el = document.getElementById('categoryGrid');
  if (!el) return;
  el.innerHTML = categories.filter(c => c !== 'همه').map(c =>
    `<a href="products.html?cat=${encodeURIComponent(c)}" class="cat-card">
      <div class="cat-icon">${icons[c] || '📦'}</div>
      <div class="cat-name">${c}</div>
    </a>`
  ).join('');
}

let activeCategory = 'همه';
let searchQuery = '';

function initProductsPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) activeCategory = params.get('cat');
  const filterEl = document.getElementById('filters');
  if (filterEl) {
    filterEl.innerHTML = categories.map(c =>
      `<button class="filter-btn ${c === activeCategory ? 'active' : ''}" onclick="setFilter('${c}')">${c}</button>`
    ).join('');
  }
  const searchEl = document.getElementById('productSearch');
  if (searchEl) {
    searchEl.addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      applyFilters();
    });
  }
  applyFilters();
}

function setFilter(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent === cat));
  applyFilters();
}

function applyFilters() {
  let list = products;
  if (activeCategory !== 'همه') list = list.filter(p => p.category === activeCategory);
  if (searchQuery) {
    list = list.filter(p =>
      p.name.includes(searchQuery) || p.category.includes(searchQuery) || p.description.includes(searchQuery)
    );
  }
  renderProducts(list, 'productsGrid');
}

function initCollectionsPage() {
  const el = document.getElementById('collectionsContainer');
  if (!el) return;
  el.innerHTML = collections.map((col, i) => {
    const prods = col.products.map(id => products.find(p => p.id === id)).filter(Boolean);
    return `<div class="collection-card">
      <div class="collection-hero theme-${i + 1}">
        <div class="collection-icon">${col.icon}</div>
        <div>
          <h2>${col.title}</h2>
          <div class="sub">${col.subtitle}</div>
          <p>${col.description}</p>
        </div>
      </div>
      <div class="collection-products"><div class="product-grid">${prods.map(productCardHTML).join('')}</div></div>
    </div>`;
  }).join('');
}

function handleContact(e) {
  e.preventDefault();
  showToast('پیام شما ارسال شد');
  e.target.reset();
}

/* ========== LIVE USD RATE — سریع ========== */
const MIN_VALID_TOMAN = 100000;
const FETCH_TIMEOUT_MS = 8000;   // هر درخواست حداکثر ۸ ثانیه
const TOTAL_TIMEOUT_MS = 15000;  // کل فرآیند حداکثر ۱۵ ثانیه
let usdRate = 193500;
let rateFetching = false;

const TARIFF = {
  default: 0.12, amazon: 0.15, shein: 0.10, zara: 0.12, lcw: 0.10,
  boyner: 0.12, koton: 0.10, defacto: 0.10, namshi: 0.12, noon: 0.12, trendyol: 0.10
};
const SHIPPING_BASE = 350000;
const SHIPPING_PER_KG = 280000;
const SERVICE_FEE_RATE = 0.05;
const SERVICE_FEE_MIN = 150000;

function clearBadCache() {
  const old = Number(localStorage.getItem('usd_free_rate') || 0);
  if (old && old < MIN_VALID_TOMAN) {
    localStorage.removeItem('usd_free_rate');
    localStorage.removeItem('usd_rate_source');
  }
}

function applyUsdRate(toman, source) {
  toman = Math.round(Number(toman));
  if (!toman || toman < MIN_VALID_TOMAN) return false;
  usdRate = toman;
  localStorage.setItem('usd_free_rate', String(toman));
  localStorage.setItem('usd_rate_source', source || '');
  localStorage.setItem('usd_rate_time', new Date().toISOString());
  const el = document.getElementById('usdRateDisplay');
  if (el) {
    const src = source ? ` <small style="color:#86868b;font-weight:400">(${source})</small>` : '';
    el.innerHTML = toman.toLocaleString('fa-IR') + ' تومان' + src;
  }
  return true;
}

function showInstantRate() {
  clearBadCache();
  const cached = Number(localStorage.getItem('usd_free_rate') || 0);
  if (cached >= MIN_VALID_TOMAN) {
    applyUsdRate(cached, 'ذخیره');
  } else {
    applyUsdRate(usdRate, 'پیش‌فرض');
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      v => { clearTimeout(t); resolve(v); },
      e => { clearTimeout(t); reject(e); }
    );
  });
}

function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { cache: 'no-store', signal: ctrl.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error('http');
      return res;
    })
    .catch(e => {
      clearTimeout(timer);
      throw e;
    });
}

function parseRialToToman(raw) {
  const digits = String(raw).replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!n) return null;
  if (n > 500000) return Math.round(n / 10);
  return n;
}

// منابع سریع (بدون پروکسی کند)
async function tryNavasanJsdelivr() {
  const res = await fetchWithTimeout(
    'https://cdn.jsdelivr.net/gh/HosseinOdd/Navasan-API@main/data/fiat.json',
    FETCH_TIMEOUT_MS
  );
  const data = await res.json();
  const v = data && data.usd && Number(data.usd.value);
  if (v >= MIN_VALID_TOMAN) return { rate: v, source: 'بازار آزاد' };
  throw new Error('invalid');
}

async function tryNavasanGithub() {
  const res = await fetchWithTimeout(
    'https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json',
    FETCH_TIMEOUT_MS
  );
  const data = await res.json();
  const v = data && data.usd && Number(data.usd.value);
  if (v >= MIN_VALID_TOMAN) return { rate: v, source: 'بازار آزاد' };
  throw new Error('invalid');
}

async function tryTgjuAjax() {
  const res = await fetchWithTimeout(
    'https://call5.tgju.org/ajax.json?t=' + Date.now(),
    FETCH_TIMEOUT_MS
  );
  const data = await res.json();
  const p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
  const toman = parseRialToToman(p);
  if (toman >= MIN_VALID_TOMAN) return { rate: toman, source: 'tgju.org' };
  throw new Error('invalid');
}

async function tryTgjuProxy() {
  const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://call5.tgju.org/ajax.json?t=' + Date.now());
  const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  const data = await res.json();
  const p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
  const toman = parseRialToToman(p);
  if (toman >= MIN_VALID_TOMAN) return { rate: toman, source: 'tgju.org' };
  throw new Error('invalid');
}

async function fetchUsdRate() {
  if (rateFetching) return;
  rateFetching = true;

  // فوراً نرخ قبلی را نشان بده (بدون انتظار)
  showInstantRate();

  const el = document.getElementById('usdRateDisplay');
  if (el && !el.dataset.loading) {
    el.dataset.loading = '1';
  }

  // همه منابع با هم؛ اولین پاسخ معتبر برنده است
  const tasks = [
    tryNavasanJsdelivr(),
    tryNavasanGithub(),
    tryTgjuAjax(),
    tryTgjuProxy()
  ].map(p => p.catch(() => null));

  try {
    const result = await withTimeout(
      (async () => {
        // بررسی ترتیبی نتایج با Promise.race روی موفقیت
        return await new Promise(resolve => {
          let pending = tasks.length;
          let done = false;
          tasks.forEach(async t => {
            const r = await t;
            pending--;
            if (!done && r && r.rate) {
              done = true;
              resolve(r);
            } else if (!done && pending === 0) {
              resolve(null);
            }
          });
        });
      })(),
      TOTAL_TIMEOUT_MS
    );

    if (result && applyUsdRate(result.rate, result.source)) {
      showToast('نرخ دلار: ' + result.rate.toLocaleString('fa-IR') + ' تومان');
    }
  } catch (e) {
    // تایم‌اوت کلی — همان نرخ لحظه‌ای/کش باقی می‌ماند
  }

  rateFetching = false;
  if (el) delete el.dataset.loading;
}

function setUsdRate(rate) {
  applyUsdRate(rate, 'دستی');
}

function calculatePrice() {
  const price = parseFloat(document.getElementById('calcPrice').value);
  const weight = parseFloat(document.getElementById('calcWeight').value);
  const store = document.getElementById('calcStore').value;
  const link = document.getElementById('calcLink').value.trim();

  if (!price || price <= 0) { showToast('قیمت کالا را وارد کنید'); return; }
  if (!weight || weight <= 0) { showToast('وزن کالا را وارد کنید'); return; }

  const productToman = price * usdRate;
  const shipping = SHIPPING_BASE + weight * SHIPPING_PER_KG;
  const tariffRate = TARIFF[store] || TARIFF.default;
  const tariff = productToman * tariffRate;
  const fee = Math.max(productToman * SERVICE_FEE_RATE, SERVICE_FEE_MIN);
  const total = productToman + shipping + tariff + fee;

  document.getElementById('rProduct').textContent = formatPrice(productToman);
  document.getElementById('rShipping').textContent = formatPrice(shipping);
  document.getElementById('rTariff').textContent = formatPrice(tariff) + ` (${Math.round(tariffRate * 100)}٪)`;
  document.getElementById('rFee').textContent = formatPrice(fee);
  document.getElementById('rTotal').textContent = formatPrice(total);
  document.getElementById('calcNote').textContent =
    'محاسبه با نرخ دلار آزاد (' + usdRate.toLocaleString('fa-IR') + ' تومان). مبلغ تقریبی است.'
    + (link ? ' لینک محصول ثبت شد.' : '');

  document.getElementById('calcResult').hidden = false;
  document.getElementById('calcResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  clearBadCache();
  updateCartUI();

  const page = document.body.dataset.page;
  if (page === 'home') {
    renderCategories();
    renderFeatured();
    showInstantRate(); // فوری
    fetchUsdRate();    // بروزرسانی در پس‌زمینه
    setInterval(fetchUsdRate, 5 * 60 * 1000);
  } else if (page === 'products') {
    initProductsPage();
  } else if (page === 'collections') {
    initCollectionsPage();
  }

  document.addEventListener('click', e => {
    const wrap = document.querySelector('.search-wrap');
    const input = document.getElementById('headerSearch');
    if (wrap && input && input.classList.contains('open') && !wrap.contains(e.target)) {
      input.classList.remove('open');
      input.value = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });
});

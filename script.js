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
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
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

/* ========== LIVE USD RATE (بازار آزاد) ========== */
// حداقل منطقی برای دلار آزاد ۱۴۰۵ ≈ بالای ۱۰۰٬۰۰۰ تومان
const MIN_VALID_TOMAN = 100000;
let usdRate = 193500; // fallback روز

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

function parseRialToToman(raw) {
  const digits = String(raw).replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!n) return null;
  // اگر عدد خیلی بزرگ بود (ریال) تبدیل به تومان
  if (n > 500000) return Math.round(n / 10);
  return n;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('http ' + res.status);
  return res.json();
}

async function fetchTextProxy(url) {
  const proxies = [
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
    'https://corsproxy.io/?' + encodeURIComponent(url)
  ];
  for (const p of proxies) {
    try {
      const res = await fetch(p, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch (e) {}
  }
  return null;
}

// ۱) منبع پایدار بدون CORS — نرخ تومان بازار آزاد
async function fetchFromNavasan() {
  const urls = [
    'https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json',
    'https://cdn.jsdelivr.net/gh/HosseinOdd/Navasan-API@main/data/fiat.json'
  ];
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      const v = data && data.usd && data.usd.value;
      if (v && Number(v) >= MIN_VALID_TOMAN) return { rate: Number(v), source: 'بازار آزاد' };
    } catch (e) {}
  }
  return null;
}

// ۲) TGJU ajax
async function fetchFromTgjuAjax() {
  const ts = Date.now();
  const ajaxUrl = 'https://call5.tgju.org/ajax.json?t=' + ts;
  try {
    let data = null;
    try {
      data = await fetchJson(ajaxUrl);
    } catch (e) {
      const text = await fetchTextProxy(ajaxUrl);
      if (text) data = JSON.parse(text);
    }
    const p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
    const toman = parseRialToToman(p);
    if (toman && toman >= MIN_VALID_TOMAN) return { rate: toman, source: 'tgju.org' };
  } catch (e) {}
  return null;
}

// ۳) صفحه TGJU
async function fetchFromTgjuPage() {
  const html = await fetchTextProxy('https://www.tgju.org/profile/price_dollar_rl');
  if (!html) return null;
  const patterns = [
    /data-col=["']info\.last_trade\.PDrCotVal["'][^>]*>([\d,]+)/i,
    /نرخ فعلی[:\s]*([\d,]{6,})/,
    /([\d]{1,3}(?:,\d{3}){2,})/
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const toman = parseRialToToman(m[1]);
      if (toman && toman >= MIN_VALID_TOMAN) return { rate: toman, source: 'tgju.org' };
    }
  }
  return null;
}

async function fetchUsdRate() {
  clearBadCache();
  const el = document.getElementById('usdRateDisplay');
  if (el) el.textContent = 'در حال دریافت نرخ لحظه‌ای...';

  const sources = [fetchFromNavasan, fetchFromTgjuAjax, fetchFromTgjuPage];
  for (const fn of sources) {
    try {
      const result = await fn();
      if (result && applyUsdRate(result.rate, result.source)) {
        showToast('نرخ دلار بروزرسانی شد: ' + result.rate.toLocaleString('fa-IR') + ' تومان');
        return;
      }
    } catch (e) {}
  }

  // کش معتبر
  const cached = Number(localStorage.getItem('usd_free_rate') || 0);
  if (cached >= MIN_VALID_TOMAN && applyUsdRate(cached, 'ذخیره محلی')) return;

  // آخرین fallback معقول
  applyUsdRate(193500, 'پیش‌فرض');
  showToast('نرخ آنلاین در دسترس نبود — از نرخ پیش‌فرض استفاده شد');
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
  let fee = Math.max(productToman * SERVICE_FEE_RATE, SERVICE_FEE_MIN);
  const total = productToman + shipping + tariff + fee;

  document.getElementById('rProduct').textContent = formatPrice(productToman);
  document.getElementById('rShipping').textContent = formatPrice(shipping);
  document.getElementById('rTariff').textContent = formatPrice(tariff) + ` (${Math.round(tariffRate * 100)}٪)`;
  document.getElementById('rFee').textContent = formatPrice(fee);
  document.getElementById('rTotal').textContent = formatPrice(total);
  document.getElementById('calcNote').textContent =
    'محاسبه با نرخ دلار آزاد لحظه‌ای (' + usdRate.toLocaleString('fa-IR') + ' تومان). مبلغ تقریبی است.'
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
    fetchUsdRate();
    setInterval(fetchUsdRate, 3 * 60 * 1000); // هر ۳ دقیقه
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

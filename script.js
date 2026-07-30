/* ========== CART (localStorage) ========== */
let cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');

function saveCart() {
  localStorage.setItem('shop_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, qty = 1) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
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

/* ========== UI UPDATES ========== */
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
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>سبد خرید خالی است</p>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
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
  return `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        <div class="product-img">${p.image}</div>
        ${badgeHTML}
      </div>
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
  const cats = categories.filter(c => c !== 'همه');
  el.innerHTML = cats.map(c => `
    <a href="products.html?cat=${encodeURIComponent(c)}" class="cat-card">
      <div class="cat-icon">${icons[c] || '📦'}</div>
      <div class="cat-name">${c}</div>
    </a>`).join('');
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
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.textContent === cat);
  });
  applyFilters();
}

function applyFilters() {
  let list = products;
  if (activeCategory !== 'همه') list = list.filter(p => p.category === activeCategory);
  if (searchQuery) {
    list = list.filter(p =>
      p.name.includes(searchQuery) ||
      p.category.includes(searchQuery) ||
      p.description.includes(searchQuery)
    );
  }
  renderProducts(list, 'productsGrid');
}

function initCollectionsPage() {
  const el = document.getElementById('collectionsContainer');
  if (!el) return;
  el.innerHTML = collections.map((col, i) => {
    const prods = col.products.map(id => products.find(p => p.id === id)).filter(Boolean);
    return `
      <div class="collection-card">
        <div class="collection-hero theme-${i + 1}">
          <div class="collection-icon">${col.icon}</div>
          <div>
            <h2>${col.title}</h2>
            <div class="sub">${col.subtitle}</div>
            <p>${col.description}</p>
          </div>
        </div>
        <div class="collection-products">
          <div class="product-grid">${prods.map(productCardHTML).join('')}</div>
        </div>
      </div>`;
  }).join('');
}

function handleContact(e) {
  e.preventDefault();
  showToast('پیام شما ارسال شد');
  e.target.reset();
}

/* ========== PRICE CALCULATOR ========== */
let usdRate = 920000; // fallback تومان

const TARIFF = {
  // درصد تقریبی تعرفه + ارزش افزوده (نمونه)
  default: 0.12,
  amazon: 0.15,
  shein: 0.10,
  zara: 0.12,
  lcw: 0.10,
  boyner: 0.12,
  koton: 0.10,
  defacto: 0.10,
  namshi: 0.12,
  noon: 0.12,
  trendyol: 0.10
};

// حمل: پایه + به ازای هر کیلو
const SHIPPING_BASE = 350000; // تومان
const SHIPPING_PER_KG = 280000; // تومان
const SERVICE_FEE_RATE = 0.05; // ۵٪ کارمزد خدمات
const SERVICE_FEE_MIN = 150000;

async function fetchUsdRate() {
  const el = document.getElementById('usdRateDisplay');
  if (el) el.textContent = 'در حال دریافت...';
  try {
    // نرخ آزاد تقریبی از API عمومی
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    if (data && data.rates && data.rates.IRR) {
      // IRR رسمی خیلی پایین است؛ برای نرخ آزاد از ضریب تقریبی بازار استفاده می‌کنیم
      // اگر API نرخ آزاد نداشت، از مقدار ذخیره‌شده/پیش‌فرض استفاده می‌شود
      const official = data.rates.IRR;
      // نرخ آزاد معمولاً چند برابر رسمی است — از localStorage یا fallback
      const stored = localStorage.getItem('usd_free_rate');
      if (stored) usdRate = Number(stored);
    }
  } catch (e) {
    // ignore
  }

  // تلاش برای نرخ آزاد ایران از طریق منبع جایگزین
  try {
    const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
    const d2 = await res2.json();
    if (d2 && d2.rates && d2.rates.IRR) {
      // همچنان رسمی است
    }
  } catch (e) {}

  // نمایش نرخ (قابل تنظیم دستی در localStorage با کلید usd_free_rate)
  const manual = localStorage.getItem('usd_free_rate');
  if (manual && Number(manual) > 10000) usdRate = Number(manual);

  if (el) el.textContent = Math.round(usdRate).toLocaleString('fa-IR') + ' تومان';
}

function setUsdRate(rate) {
  usdRate = rate;
  localStorage.setItem('usd_free_rate', String(rate));
  const el = document.getElementById('usdRateDisplay');
  if (el) el.textContent = Math.round(usdRate).toLocaleString('fa-IR') + ' تومان';
}

function calculatePrice() {
  const price = parseFloat(document.getElementById('calcPrice').value);
  const weight = parseFloat(document.getElementById('calcWeight').value);
  const store = document.getElementById('calcStore').value;
  const link = document.getElementById('calcLink').value.trim();

  if (!price || price <= 0) {
    showToast('قیمت کالا را وارد کنید');
    return;
  }
  if (!weight || weight <= 0) {
    showToast('وزن کالا را وارد کنید');
    return;
  }

  const productToman = price * usdRate;
  const shipping = SHIPPING_BASE + (weight * SHIPPING_PER_KG);
  const tariffRate = TARIFF[store] || TARIFF.default;
  const tariff = productToman * tariffRate;
  let fee = productToman * SERVICE_FEE_RATE;
  if (fee < SERVICE_FEE_MIN) fee = SERVICE_FEE_MIN;
  const total = productToman + shipping + tariff + fee;

  document.getElementById('rProduct').textContent = formatPrice(productToman);
  document.getElementById('rShipping').textContent = formatPrice(shipping);
  document.getElementById('rTariff').textContent = formatPrice(tariff) + ` (${Math.round(tariffRate * 100)}٪)`;
  document.getElementById('rFee').textContent = formatPrice(fee);
  document.getElementById('rTotal').textContent = formatPrice(total);

  const note = document.getElementById('calcNote');
  note.textContent = link
    ? 'لینک ثبت شد. این مبلغ تقریبی است و پس از بررسی نهایی ممکن است کمی تغییر کند.'
    : 'این مبلغ تقریبی است بر اساس نرخ دلار لحظه‌ای و تعرفه‌های نمونه. مبلغ نهایی پس از بررسی لینک اعلام می‌شود.';

  document.getElementById('calcResult').hidden = false;
  document.getElementById('calcResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const page = document.body.dataset.page;
  if (page === 'home') {
    renderCategories();
    renderFeatured();
    fetchUsdRate();
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
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
  });
});

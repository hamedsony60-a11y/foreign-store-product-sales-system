function renderFeatured() { renderProducts(products.slice(0, 8), 'featuredProducts'); }
function renderCategories() {
  var icons = { 'پوشاک':'👗','کفش':'👟','الکترونیک':'🎧','اکسسوری':'👜','زیبایی':'💄' };
  var el = document.getElementById('categoryGrid');
  if (!el) return;
  el.innerHTML = categories.filter(function(c){ return c !== 'همه'; }).map(function(c){
    return '<a href="products.html?cat=' + encodeURIComponent(c) + '" class="cat-card"><div class="cat-icon">' +
      (icons[c]||'📦') + '</div><div class="cat-name">' + c + '</div></a>';
  }).join('');
}
var activeCategory = 'همه';
var searchQuery = '';
function initProductsPage() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('cat')) activeCategory = params.get('cat');
  var filterEl = document.getElementById('filters');
  if (filterEl) {
    filterEl.innerHTML = categories.map(function(c){
      return '<button class="filter-btn' + (c===activeCategory?' active':'') + '" onclick="setFilter(\'' + c + '\')">' + c + '</button>';
    }).join('');
  }
  var searchEl = document.getElementById('productSearch');
  if (searchEl) searchEl.addEventListener('input', function(e){ searchQuery = e.target.value.trim(); applyFilters(); });
  applyFilters();
}
function setFilter(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('active', b.textContent === cat); });
  applyFilters();
}
function applyFilters() {
  var list = products;
  if (activeCategory !== 'همه') list = list.filter(function(p){ return p.category === activeCategory; });
  if (searchQuery) list = list.filter(function(p){
    return p.name.indexOf(searchQuery)>=0 || p.category.indexOf(searchQuery)>=0 || (p.description||'').indexOf(searchQuery)>=0;
  });
  renderProducts(list, 'productsGrid');
}
function initCollectionsPage() {
  var el = document.getElementById('collectionsContainer');
  if (!el) return;
  el.innerHTML = collections.map(function(col, i){
    var prods = col.products.map(function(id){ return products.find(function(p){ return p.id===id; }); }).filter(Boolean);
    return '<div class="collection-card"><div class="collection-hero theme-' + (i+1) + '">' +
      '<div class="collection-icon">' + col.icon + '</div><div><h2>' + col.title + '</h2>' +
      '<div class="sub">' + col.subtitle + '</div><p>' + col.description + '</p></div></div>' +
      '<div class="collection-products"><div class="product-grid">' + prods.map(productCardHTML).join('') + '</div></div></div>';
  }).join('');
}
function handleContact(e) { e.preventDefault(); showToast('پیام شما ارسال شد'); e.target.reset(); }

var MIN_VALID_TOMAN = 150000;
var MAX_VALID_TOMAN = 500000;
var rateFetching = false;
var TGJU_PAGE = 'https://www.tgju.org/profile/price_dollar_rl';

function parseToToman(raw) {
  if (raw == null) return null;
  if (typeof raw === 'number') {
    if (raw > 1000000) return Math.round(raw / 10);
    return Math.round(raw);
  }
  var s = String(raw).replace(/[۰-۹]/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
  s = s.replace(/,/g, '').replace(/[^\d.]/g, '');
  var n = parseFloat(s);
  if (!n) return null;
  if (n > 1000000) return Math.round(n / 10);
  return Math.round(n);
}
function isValidRate(t) {
  return t && t >= MIN_VALID_TOMAN && t <= MAX_VALID_TOMAN;
}
function applyUsdRate(toman, source) {
  toman = parseToToman(toman);
  if (!isValidRate(toman)) return false;
  usdRate = toman;
  localStorage.setItem('usd_free_rate', String(toman));
  localStorage.setItem('usd_rate_source', source || 'tgju.org');
  localStorage.setItem('usd_rate_time', new Date().toISOString());
  var el = document.getElementById('usdRateDisplay');
  if (el) {
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    el.innerHTML = toman.toLocaleString('fa-IR') + ' تومان <small style="opacity:.75">(tgju.org ' + time + ')</small>';
  }
  return true;
}
function showInstantRate() {
  var cached = Number(localStorage.getItem('usd_free_rate') || 0);
  if (isValidRate(cached)) applyUsdRate(cached, localStorage.getItem('usd_rate_source') || 'tgju.org');
  else applyUsdRate(usdRate >= MIN_VALID_TOMAN ? usdRate : 194500, 'برآورد');
}
function fetchWithTimeout(url, ms) {
  ms = ms || 12000;
  var ctrl = new AbortController();
  var timer = setTimeout(function(){ ctrl.abort(); }, ms);
  return fetch(url, { cache: 'no-store', signal: ctrl.signal, mode: 'cors' })
    .then(function(res){ clearTimeout(timer); if (!res.ok) throw new Error('http'); return res; })
    .catch(function(e){ clearTimeout(timer); throw e; });
}
function extractRateFromTgjuHtml(html) {
  if (!html || html.length < 100) return null;
  var patterns = [
    /info-price[^>]*>\s*([0-9,۰-۹\s]+)/i,
    /data-price=["'](\d+)["']/i,
    /price_dollar_rl[\s\S]{0,200}?([0-9]{2,3},[0-9]{3},[0-9]{3})/i,
    />([0-9]{2,3},[0-9]{3},[0-9]{3})</g,
    /"p"\s*:\s*"([0-9,]+)"/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = html.match(patterns[i]);
    if (m && m[1]) {
      var t = parseToToman(m[1]);
      if (isValidRate(t)) return t;
    }
  }
  var all = html.match(/[0-9]{2,3},[0-9]{3},[0-9]{3}/g) || [];
  for (var j = 0; j < all.length; j++) {
    var t2 = parseToToman(all[j]);
    if (isValidRate(t2)) return t2;
  }
  return null;
}
function extractRateFromTgjuJson(data) {
  try {
    var p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
    return parseToToman(p);
  } catch (e) { return null; }
}

/* دکمه ↻ — فقط از tgju.org می‌گیرد */
function fetchUsdRate() {
  if (rateFetching) return;
  rateFetching = true;
  var el = document.getElementById('usdRateDisplay');
  if (el) el.textContent = 'در حال دریافت از tgju.org...';
  showToast('در حال گرفتن نرخ از tgju.org');

  var pageEnc = encodeURIComponent(TGJU_PAGE);
  var ajaxEnc = encodeURIComponent('https://call5.tgju.org/ajax.json?t=' + Date.now());

  var attempts = [
    // صفحه اصلی مورد نظر کاربر
    function(){ return fetchWithTimeout('https://api.allorigins.win/raw?url=' + pageEnc, 15000).then(function(r){ return r.text(); }).then(function(html){
      var t = extractRateFromTgjuHtml(html);
      if (!isValidRate(t)) throw new Error('parse');
      return t;
    }); },
    function(){ return fetchWithTimeout('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(TGJU_PAGE), 15000).then(function(r){ return r.text(); }).then(function(html){
      var t = extractRateFromTgjuHtml(html);
      if (!isValidRate(t)) throw new Error('parse');
      return t;
    }); },
    // API خود tgju (همان نرخ صفحه)
    function(){ return fetchWithTimeout('https://api.allorigins.win/raw?url=' + ajaxEnc, 12000).then(function(r){ return r.json(); }).then(function(data){
      var t = extractRateFromTgjuJson(data);
      if (!isValidRate(t)) throw new Error('parse');
      return t;
    }); },
    function(){ return fetchWithTimeout('https://call5.tgju.org/ajax.json?t=' + Date.now(), 8000).then(function(r){ return r.json(); }).then(function(data){
      var t = extractRateFromTgjuJson(data);
      if (!isValidRate(t)) throw new Error('parse');
      return t;
    }); },
    function(){ return fetchWithTimeout('https://call1.tgju.org/ajax.json?t=' + Date.now(), 8000).then(function(r){ return r.json(); }).then(function(data){
      var t = extractRateFromTgjuJson(data);
      if (!isValidRate(t)) throw new Error('parse');
      return t;
    }); }
  ];

  var i = 0;
  function next() {
    if (i >= attempts.length) {
      rateFetching = false;
      showInstantRate();
      showToast('اتصال به tgju.org برقرار نشد — دوباره ↻ را بزن');
      return;
    }
    var fn = attempts[i++];
    fn().then(function(rate){
      rateFetching = false;
      if (applyUsdRate(rate, 'tgju.org')) {
        showToast('نرخ tgju.org: ' + rate.toLocaleString('fa-IR') + ' تومان');
      } else {
        next();
      }
    }).catch(function(){ next(); });
  }
  next();
}

var TARIFF = { default:0.12, amazon:0.15, shein:0.10, zara:0.12, lcw:0.10, boyner:0.12, koton:0.10, defacto:0.10, namshi:0.12, noon:0.12, trendyol:0.10 };
function calculatePrice() {
  var priceEl = document.getElementById('calcPrice');
  var weightEl = document.getElementById('calcWeight');
  var storeEl = document.getElementById('calcStore');
  if (!priceEl || !weightEl) return;
  var price = parseFloat(priceEl.value);
  var weight = parseFloat(weightEl.value);
  var store = storeEl ? storeEl.value : 'zara';
  var link = (document.getElementById('calcLink')||{}).value || '';
  if (!price || price <= 0) { showToast('قیمت کالا را وارد کنید'); return; }
  if (!weight || weight <= 0) { showToast('وزن کالا را وارد کنید'); return; }
  var productToman = price * usdRate;
  var shipping = 350000 + weight * 280000;
  var tariffRate = TARIFF[store] || TARIFF.default;
  var tariff = productToman * tariffRate;
  var fee = Math.max(productToman * 0.05, 150000);
  var total = productToman + shipping + tariff + fee;
  document.getElementById('rProduct').textContent = formatPrice(productToman);
  document.getElementById('rShipping').textContent = formatPrice(shipping);
  document.getElementById('rTariff').textContent = formatPrice(tariff) + ' (' + Math.round(tariffRate*100) + '٪)';
  document.getElementById('rFee').textContent = formatPrice(fee);
  document.getElementById('rTotal').textContent = formatPrice(total);
  document.getElementById('calcNote').textContent = 'محاسبه با نرخ tgju.org: ' + usdRate.toLocaleString('fa-IR') + ' تومان' + (link ? ' — لینک ثبت شد' : '');
  document.getElementById('calcResult').hidden = false;
}
function renderCheckoutSummary() {
  var box = document.getElementById('checkoutItems');
  var totalEl = document.getElementById('checkoutTotal');
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = '<p class="calc-note">سبد خرید خالی است. <a href="products.html" style="color:var(--brand)">محصولات</a></p>';
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }
  box.innerHTML = cart.map(function(item){
    var p = products.find(function(pr){ return pr.id===item.id; });
    if (!p) return '';
    return '<div class="checkout-line"><span>' + p.name + ' × ' + item.qty + '</span><strong>' + formatPrice(p.price*item.qty) + '</strong></div>';
  }).join('');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}
function startPayment(e) {
  e.preventDefault();
  if (!cart.length) { showToast('سبد خرید خالی است'); return false; }
  var name = ((document.getElementById('fullName')||{}).value||'').trim();
  var phone = ((document.getElementById('phone')||{}).value||'').trim();
  var address = ((document.getElementById('address')||{}).value||'').trim();
  if (!name||!phone||!address) { showToast('لطفاً فیلدهای ضروری را پر کنید'); return false; }
  var gateway = (document.querySelector('input[name="gateway"]:checked')||{}).value||'zarinpal';
  var names = { zarinpal:'زرین‌پال', idpay:'آیدی‌پی', nextpay:'نکست‌پی' };
  var order = { code:'ORD-'+Date.now().toString().slice(-8), name:name, phone:phone, address:address,
    postal:((document.getElementById('postal')||{}).value||''), gateway:gateway, total:getCartTotal(),
    items:cart.slice(), createdAt:new Date().toISOString() };
  localStorage.setItem('pending_order', JSON.stringify(order));
  var logo = document.getElementById('gatewayLogo');
  var price = document.getElementById('gatewayPrice');
  if (logo) logo.textContent = names[gateway]||gateway;
  if (price) price.textContent = formatPrice(order.total);
  var ov = document.getElementById('gatewayOverlay');
  if (ov) ov.classList.add('open');
  return false;
}
function completePayment(success) {
  var ov = document.getElementById('gatewayOverlay');
  if (ov) ov.classList.remove('open');
  if (!success) { showToast('پرداخت لغو شد'); return; }
  var raw = localStorage.getItem('pending_order');
  if (!raw) { showToast('سفارشی یافت نشد'); return; }
  var order = JSON.parse(raw);
  order.status = 'paid';
  localStorage.setItem('last_order_code', order.code);
  localStorage.setItem('last_order', JSON.stringify(order));
  localStorage.removeItem('pending_order');
  cart = []; saveCart();
  window.location.href = 'payment-success.html';
}

function bootShop() {
  try {
    updateCartUI();
    var page = document.body && document.body.dataset.page;
    if (page === 'home') { renderCategories(); renderFeatured(); showInstantRate(); fetchUsdRate(); }
    else if (page === 'products') initProductsPage();
    else if (page === 'collections') initCollectionsPage();
    else if (page === 'checkout') renderCheckoutSummary();
    else if (page === 'calculator') { showInstantRate(); fetchUsdRate(); }
  } catch (err) { console.error(err); }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootShop);
} else {
  bootShop();
}
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') { closeModal(); closeCart(); }
});

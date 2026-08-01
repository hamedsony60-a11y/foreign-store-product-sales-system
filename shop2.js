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
  localStorage.setItem('usd_rate_source', source || '');
  localStorage.setItem('usd_rate_time', new Date().toISOString());
  var el = document.getElementById('usdRateDisplay');
  if (el) {
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    el.textContent = toman.toLocaleString('fa-IR') + ' تومان — ' + (source || 'بازار') + ' ' + time;
  }
  return true;
}

function showInstantRate() {
  var cached = Number(localStorage.getItem('usd_free_rate') || 0);
  var t = localStorage.getItem('usd_rate_time');
  var age = t ? (Date.now() - new Date(t).getTime()) : 1e15;
  if (isValidRate(cached) && age < 2 * 60 * 60 * 1000) {
    applyUsdRate(cached, localStorage.getItem('usd_rate_source') || 'کش');
  } else {
    if (!isValidRate(cached)) {
      localStorage.removeItem('usd_free_rate');
      localStorage.removeItem('usd_rate_source');
    }
    applyUsdRate(usdRate >= MIN_VALID_TOMAN ? usdRate : 194500, 'برآورد');
  }
}

function fetchWithTimeout(url, ms) {
  ms = ms || 10000;
  var ctrl = new AbortController();
  var timer = setTimeout(function(){ ctrl.abort(); }, ms);
  return fetch(url, { cache: 'no-store', signal: ctrl.signal })
    .then(function(res){
      clearTimeout(timer);
      if (!res.ok) throw new Error('http');
      return res;
    })
    .catch(function(e){ clearTimeout(timer); throw e; });
}

function tryNavasan(url, label) {
  return fetchWithTimeout(url, 8000).then(function(r){ return r.json(); }).then(function(data){
    var v = data && data.usd && data.usd.value;
    var t = parseToToman(v);
    if (!isValidRate(t)) throw new Error('bad');
    return { rate: t, source: label };
  });
}

function tryTgjuAjax(host) {
  return fetchWithTimeout(host + '/ajax.json?t=' + Date.now(), 8000)
    .then(function(r){ return r.json(); })
    .then(function(data){
      var p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
      var t = parseToToman(p);
      if (!isValidRate(t)) throw new Error('bad');
      return { rate: t, source: 'tgju' };
    });
}

function tryTgjuProxy() {
  var target = encodeURIComponent('https://call5.tgju.org/ajax.json?t=' + Date.now());
  return fetchWithTimeout('https://api.allorigins.win/raw?url=' + target, 12000)
    .then(function(r){ return r.json(); })
    .then(function(data){
      var p = data && data.current && data.current.price_dollar_rl && data.current.price_dollar_rl.p;
      var t = parseToToman(p);
      if (!isValidRate(t)) throw new Error('bad');
      return { rate: t, source: 'tgju' };
    });
}

function tryTgjuHtml() {
  var target = encodeURIComponent('https://www.tgju.org/profile/price_dollar_rl');
  return fetchWithTimeout('https://api.allorigins.win/raw?url=' + target, 15000)
    .then(function(r){ return r.text(); })
    .then(function(html){
      var m = html.match(/info-price[^>]*>\s*([0-9,۰-۹]+)/) ||
              html.match(/data-price="(\d+)"/) ||
              html.match(/>([0-9]{2,3},[0-9]{3},[0-9]{3})</);
      if (!m) throw new Error('no price');
      var t = parseToToman(m[1]);
      if (!isValidRate(t)) throw new Error('bad');
      return { rate: t, source: 'tgju.org' };
    });
}

function median(nums) {
  nums = nums.slice().sort(function(a,b){ return a-b; });
  var m = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[m] : Math.round((nums[m-1] + nums[m]) / 2);
}

function fetchUsdRate() {
  if (rateFetching) return;
  rateFetching = true;
  showInstantRate();
  var el = document.getElementById('usdRateDisplay');
  if (el) el.style.opacity = '0.7';

  var tasks = [
    tryNavasan('https://cdn.jsdelivr.net/gh/HosseinOdd/Navasan-API@main/data/fiat.json', 'بازار آزاد'),
    tryNavasan('https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json', 'بازار آزاد'),
    tryTgjuAjax('https://call5.tgju.org'),
    tryTgjuAjax('https://call1.tgju.org'),
    tryTgjuProxy(),
    tryTgjuHtml()
  ];

  var rates = [];
  var sources = [];
  var pending = tasks.length;

  function finish() {
    rateFetching = false;
    if (el) el.style.opacity = '1';
    if (!rates.length) {
      showToast('نرخ آنلاین در دسترس نیست — از آخرین نرخ استفاده شد');
      return;
    }
    var finalRate = rates.length >= 2 ? median(rates) : rates[0];
    var src = sources[0] || 'بازار';
    if (applyUsdRate(finalRate, src)) {
      showToast('نرخ دلار: ' + finalRate.toLocaleString('fa-IR') + ' تومان');
    }
  }

  tasks.forEach(function(p){
    p.then(function(r){
      if (r && isValidRate(r.rate)) {
        rates.push(r.rate);
        sources.push(r.source);
      }
    }).catch(function(){}).then(function(){
      pending--;
      if (pending === 0) finish();
    });
  });

  setTimeout(function(){
    if (rateFetching) finish();
  }, 18000);
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
  document.getElementById('calcNote').textContent = 'محاسبه با نرخ لحظه‌ای ' + usdRate.toLocaleString('fa-IR') + ' تومان' + (link ? ' — لینک ثبت شد' : '');
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

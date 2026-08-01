/* Shop core part 1 */
var cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
(function(){
  var old = Number(localStorage.getItem('usd_free_rate') || 0);
  if (old && old < 150000) {
    localStorage.removeItem('usd_free_rate');
    localStorage.removeItem('usd_rate_source');
    localStorage.removeItem('usd_rate_time');
  }
})();
var usdRate = Number(localStorage.getItem('usd_free_rate') || 0) || 194500;

function saveCart() {
  localStorage.setItem('shop_cart', JSON.stringify(cart));
  updateCartUI();
}
function addToCart(id, qty) {
  qty = qty || 1;
  var ex = cart.find(function(i){ return i.id === id; });
  if (ex) ex.qty += qty; else cart.push({ id: id, qty: qty });
  saveCart();
  showToast('به سبد خرید اضافه شد');
  bumpTotal();
}
function removeFromCart(id) {
  cart = cart.filter(function(i){ return i.id !== id; });
  saveCart();
}
function changeQty(id, delta) {
  var item = cart.find(function(i){ return i.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id); else saveCart();
  bumpTotal();
}
function getCartTotal() {
  return cart.reduce(function(sum, item) {
    var p = products.find(function(pr){ return pr.id === item.id; });
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}
function getCartCount() {
  return cart.reduce(function(sum, i){ return sum + i.qty; }, 0);
}
function formatPrice(n) {
  return Math.round(n).toLocaleString('fa-IR') + ' تومان';
}
function updateCartUI() {
  var count = getCartCount();
  var badge = document.getElementById('cartCount');
  if (badge) { badge.textContent = count; badge.classList.toggle('show', count > 0); }
  var totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
  var container = document.getElementById('cartItems');
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = '<div class="cart-empty"><p>سبد خرید خالی است</p></div>';
    return;
  }
  container.innerHTML = cart.map(function(item) {
    var p = products.find(function(pr){ return pr.id === item.id; });
    if (!p) return '';
    return '<div class="cart-item"><div class="cart-item-img">' + p.image + '</div><div class="cart-item-info">' +
      '<div class="cart-item-name">' + p.name + '</div><div class="cart-item-price">' + formatPrice(p.price) + '</div>' +
      '<div class="cart-item-actions"><button class="qty-btn" onclick="changeQty(' + p.id + ',-1)">−</button>' +
      '<span class="qty-num">' + item.qty + '</span>' +
      '<button class="qty-btn" onclick="changeQty(' + p.id + ',1)">+</button>' +
      '<button class="cart-item-remove" onclick="removeFromCart(' + p.id + ')">حذف</button></div></div></div>';
  }).join('');
}
function bumpTotal() {
  var row = document.getElementById('cartTotalRow');
  if (!row) return;
  row.classList.remove('bump'); void row.offsetWidth; row.classList.add('bump');
}
function openCart() {
  var a = document.getElementById('cartOverlay');
  var b = document.getElementById('cartDrawer');
  if (a) a.classList.add('open');
  if (b) b.classList.add('open');
  updateCartUI();
}
function closeCart() {
  var a = document.getElementById('cartOverlay');
  var b = document.getElementById('cartDrawer');
  if (a) a.classList.remove('open');
  if (b) b.classList.remove('open');
}
function toggleSearch() {
  var input = document.getElementById('headerSearch');
  if (!input) return;
  input.classList.toggle('open');
  if (input.classList.contains('open')) input.focus(); else input.value = '';
}
function toggleMenu() {
  var nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('mobile-open');
}
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(function(){ t.classList.remove('show'); }, 2000);
}
function productCardHTML(p) {
  var badgeClass = p.badge === 'جدید' ? ' new' : '';
  var badgeHTML = p.badge ? '<span class="product-badge' + badgeClass + '">' + p.badge + '</span>' : '';
  return '<div class="product-card" onclick="openModal(' + p.id + ')">' +
    '<div class="product-img-wrap"><div class="product-img">' + p.image + '</div>' + badgeHTML + '</div>' +
    '<div class="product-body"><div class="product-cat">' + p.category + '</div>' +
    '<div class="product-name">' + p.name + '</div><div class="product-footer">' +
    '<div class="product-price">' + formatPrice(p.price) + '</div>' +
    '<button class="btn-add" onclick="event.stopPropagation();addToCart(' + p.id + ')">+</button>' +
    '</div></div></div>';
}
function openModal(id) {
  var p = products.find(function(pr){ return pr.id === id; });
  if (!p) return;
  var set = function(id, v){ var el = document.getElementById(id); if (el) el.textContent = v; };
  set('modalImg', p.image); set('modalCat', p.category); set('modalName', p.name);
  set('modalDesc', p.description); set('modalPrice', formatPrice(p.price));
  var btn = document.getElementById('modalAddBtn');
  if (btn) btn.onclick = function(){ addToCart(p.id); closeModal(); };
  var ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.add('open');
}
function closeModal() {
  var ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.remove('open');
}
function renderProducts(list, containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div class="no-results">محصولی یافت نشد</div>'; return; }
  el.innerHTML = list.map(productCardHTML).join('');
}

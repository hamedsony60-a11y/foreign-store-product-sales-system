function renderCheckoutSummary() {
  var box = document.getElementById('checkoutItems');
  var totalEl = document.getElementById('checkoutTotal');
  if (!box) return;
  if (typeof cart === 'undefined' || !cart.length) {
    box.innerHTML = '<p class="calc-note">سبد خرید خالی است. <a href="products.html" style="color:var(--brand)">مشاهده محصولات</a></p>';
    if (totalEl && typeof formatPrice === 'function') totalEl.textContent = formatPrice(0);
    return;
  }
  box.innerHTML = cart.map(function (item) {
    var p = products.find(function (pr) { return pr.id === item.id; });
    if (!p) return '';
    return '<div class="checkout-line"><span>' + p.name + ' × ' + item.qty + '</span><strong>' + formatPrice(p.price * item.qty) + '</strong></div>';
  }).join('');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

function startPayment(e) {
  e.preventDefault();
  if (!cart.length) { showToast('سبد خرید خالی است'); return false; }
  var name = (document.getElementById('fullName') || {}).value || '';
  var phone = (document.getElementById('phone') || {}).value || '';
  var address = (document.getElementById('address') || {}).value || '';
  if (!name.trim() || !phone.trim() || !address.trim()) {
    showToast('لطفاً فیلدهای ضروری را پر کنید');
    return false;
  }
  var gateway = (document.querySelector('input[name="gateway"]:checked') || {}).value || 'zarinpal';
  var names = { zarinpal: 'زرین‌پال', idpay: 'آیدی‌پی', nextpay: 'نکست‌پی' };
  var order = {
    code: 'ORD-' + Date.now().toString().slice(-8),
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    postal: ((document.getElementById('postal') || {}).value || ''),
    gateway: gateway,
    total: getCartTotal(),
    items: cart.slice(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pending_order', JSON.stringify(order));
  var logo = document.getElementById('gatewayLogo');
  var price = document.getElementById('gatewayPrice');
  if (logo) logo.textContent = names[gateway] || gateway;
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
  cart = [];
  saveCart();
  window.location.href = 'payment-success.html';
}

/* ========== CHECKOUT + PAYMENT ========== */
function renderCheckoutSummary() {
  const box = document.getElementById('checkoutItems');
  const totalEl = document.getElementById('checkoutTotal');
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = '<p class="calc-note">سبد خرید خالی است. <a href="products.html" style="color:var(--brand)">مشاهده محصولات</a></p>';
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }
  box.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    return '<div class="checkout-line"><span>' + p.name + ' × ' + item.qty + '</span><strong>' + formatPrice(p.price * item.qty) + '</strong></div>';
  }).join('');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

function startPayment(e) {
  e.preventDefault();
  if (!cart.length) { showToast('سبد خرید خالی است'); return false; }
  const name = ((document.getElementById('fullName') || {}).value || '').trim();
  const phone = ((document.getElementById('phone') || {}).value || '').trim();
  const address = ((document.getElementById('address') || {}).value || '').trim();
  if (!name || !phone || !address) { showToast('لطفاً فیلدهای ضروری را پر کنید'); return false; }
  const gateway = (document.querySelector('input[name="gateway"]:checked') || {}).value || 'zarinpal';
  const names = { zarinpal: 'زرین‌پال', idpay: 'آیدی‌پی', nextpay: 'نکست‌پی' };
  const order = {
    code: 'ORD-' + Date.now().toString().slice(-8),
    name, phone, address,
    postal: ((document.getElementById('postal') || {}).value || ''),
    gateway, total: getCartTotal(), items: cart.slice(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pending_order', JSON.stringify(order));
  const logo = document.getElementById('gatewayLogo');
  const price = document.getElementById('gatewayPrice');
  if (logo) logo.textContent = names[gateway] || gateway;
  if (price) price.textContent = formatPrice(order.total);
  const ov = document.getElementById('gatewayOverlay');
  if (ov) ov.classList.add('open');
  return false;
}

function completePayment(success) {
  const ov = document.getElementById('gatewayOverlay');
  if (ov) ov.classList.remove('open');
  if (!success) { showToast('پرداخت لغو شد'); return; }
  const raw = localStorage.getItem('pending_order');
  if (!raw) { showToast('سفارشی یافت نشد'); return; }
  const order = JSON.parse(raw);
  order.status = 'paid';
  localStorage.setItem('last_order_code', order.code);
  localStorage.setItem('last_order', JSON.stringify(order));
  localStorage.removeItem('pending_order');
  cart = [];
  saveCart();
  window.location.href = 'payment-success.html';
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  clearBadCache();
  updateCartUI();

  const page = document.body.dataset.page;
  if (page === 'home') {
    renderCategories();
    renderFeatured();
    showInstantRate();
    fetchUsdRate();
    setInterval(fetchUsdRate, 5 * 60 * 1000);
  } else if (page === 'checkout') {
    renderCheckoutSummary();
  } else if (page === 'calculator') {
    showInstantRate();
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
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });
});

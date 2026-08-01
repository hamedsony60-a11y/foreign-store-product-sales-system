/* Multi-currency rates: USD, AED (درهم), TRY (لیر) — fast parallel fetch */
var MIN_VALID = { usd: 150000, aed: 30000, try: 2000 };
var MAX_VALID = { usd: 500000, aed: 120000, try: 15000 };
var rateFetching = false;

var rates = {
  usd: Number(localStorage.getItem('rate_usd') || 0) || 194200,
  aed: Number(localStorage.getItem('rate_aed') || 0) || 53000,
  try: Number(localStorage.getItem('rate_try') || 0) || 4100
};

// keep legacy
var usdRate = rates.usd;
var MIN_VALID_TOMAN = 150000;
var MAX_VALID_TOMAN = 500000;

function parseToToman(raw, currency) {
  if (raw == null) return null;
  var n;
  if (typeof raw === 'number') n = raw;
  else {
    var s = String(raw).replace(/[۰-۹]/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    });
    s = s.replace(/,/g, '').replace(/[^\d.]/g, '');
    n = parseFloat(s);
  }
  if (!n) return null;
  // TGJU often in Rial for USD/AED
  if (currency === 'usd' && n > 1000000) n = Math.round(n / 10);
  if (currency === 'aed' && n > 200000) n = Math.round(n / 10);
  return Math.round(n);
}

function isValidRate(t, currency) {
  currency = currency || 'usd';
  return t && t >= (MIN_VALID[currency] || 1000) && t <= (MAX_VALID[currency] || 1e7);
}

function applyRate(currency, toman, source) {
  toman = parseToToman(toman, currency);
  if (!isValidRate(toman, currency)) return false;
  rates[currency] = toman;
  localStorage.setItem('rate_' + currency, String(toman));
  localStorage.setItem('rate_' + currency + '_src', source || '');
  localStorage.setItem('rate_' + currency + '_time', new Date().toISOString());
  if (currency === 'usd') {
    usdRate = toman;
    localStorage.setItem('usd_free_rate', String(toman));
  }
  updateRatesUI();
  return true;
}

function applyUsdRate(toman, source) {
  return applyRate('usd', toman, source);
}

function updateRatesUI() {
  var now = new Date();
  var time =
    now.getHours().toString().padStart(2, '0') +
    ':' +
    now.getMinutes().toString().padStart(2, '0');

  var el = document.getElementById('usdRateDisplay');
  if (el) {
    el.innerHTML =
      rates.usd.toLocaleString('fa-IR') +
      ' تومان <small style="opacity:.75">(دلار ' +
      time +
      ')</small>';
  }

  var box = document.getElementById('multiRates');
  if (box) {
    box.innerHTML =
      '<div class="rate-chip"><span>دلار</span><strong>' +
      rates.usd.toLocaleString('fa-IR') +
      '</strong></div>' +
      '<div class="rate-chip"><span>درهم</span><strong>' +
      rates.aed.toLocaleString('fa-IR') +
      '</strong></div>' +
      '<div class="rate-chip"><span>لیر</span><strong>' +
      rates.try.toLocaleString('fa-IR') +
      '</strong></div>';
  }

  var aedEl = document.getElementById('rateAed');
  var tryEl = document.getElementById('rateTry');
  var usdEl = document.getElementById('rateUsd');
  if (usdEl) usdEl.textContent = rates.usd.toLocaleString('fa-IR');
  if (aedEl) aedEl.textContent = rates.aed.toLocaleString('fa-IR');
  if (tryEl) tryEl.textContent = rates.try.toLocaleString('fa-IR');
}

function showInstantRate() {
  ['usd', 'aed', 'try'].forEach(function (c) {
    var cached = Number(localStorage.getItem('rate_' + c) || 0);
    if (isValidRate(cached, c)) rates[c] = cached;
  });
  // legacy usd cache
  var old = Number(localStorage.getItem('usd_free_rate') || 0);
  if (isValidRate(old, 'usd')) rates.usd = old;
  usdRate = rates.usd;
  updateRatesUI();
}

function fetchWithTimeout(url, ms) {
  ms = ms || 5000;
  var ctrl = new AbortController();
  var timer = setTimeout(function () {
    ctrl.abort();
  }, ms);
  return fetch(url, { cache: 'no-store', signal: ctrl.signal, mode: 'cors' })
    .then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('http');
      return res;
    })
    .catch(function (e) {
      clearTimeout(timer);
      throw e;
    });
}

function extractFromText(text, currency) {
  if (!text) return null;
  var re = /([0-9]{1,3}(?:,[0-9]{3}){1,3})/g;
  var m;
  var candidates = [];
  while ((m = re.exec(text)) !== null) {
    var t = parseToToman(m[1], currency);
    if (isValidRate(t, currency)) candidates.push(t);
  }
  if (!candidates.length) return null;
  var freq = {};
  candidates.forEach(function (c) {
    freq[c] = (freq[c] || 0) + 1;
  });
  var best = candidates[0];
  var bestN = 0;
  Object.keys(freq).forEach(function (k) {
    if (freq[k] > bestN) {
      bestN = freq[k];
      best = Number(k);
    }
  });
  return best;
}

function fromNavasanAll() {
  return fetchWithTimeout(
    'https://cdn.jsdelivr.net/gh/HosseinOdd/Navasan-API@main/data/fiat.json',
    4000
  )
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var out = {};
      if (data.usd) out.usd = parseToToman(data.usd.value, 'usd');
      if (data.aed) out.aed = parseToToman(data.aed.value, 'aed');
      if (data.try) out.try = parseToToman(data.try.value, 'try');
      return out;
    });
}

function fromNavasanRaw() {
  return fetchWithTimeout(
    'https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json',
    4000
  )
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var out = {};
      if (data.usd) out.usd = parseToToman(data.usd.value, 'usd');
      if (data.aed) out.aed = parseToToman(data.aed.value, 'aed');
      if (data.try) out.try = parseToToman(data.try.value, 'try');
      return out;
    });
}

function fromJina(url, currency) {
  return fetchWithTimeout('https://r.jina.ai/' + url, 5000)
    .then(function (r) {
      return r.text();
    })
    .then(function (text) {
      var t = extractFromText(text, currency);
      if (!isValidRate(t, currency)) throw new Error('parse');
      var o = {};
      o[currency] = t;
      return o;
    });
}

function getSelectedCurrency() {
  var el = document.getElementById('calcCurrency');
  return (el && el.value) || 'usd';
}

function getActiveRate() {
  var c = getSelectedCurrency();
  return rates[c] || rates.usd;
}

function fetchUsdRate() {
  if (rateFetching) return;
  rateFetching = true;
  showInstantRate();
  if (typeof showToast === 'function') showToast('بروزرسانی نرخ‌ها...');

  var el = document.getElementById('usdRateDisplay');
  if (el) el.style.opacity = '0.65';

  var got = { usd: false, aed: false, try: false };
  var finished = false;

  function tryApply(obj, source) {
    if (!obj) return;
    ['usd', 'aed', 'try'].forEach(function (c) {
      if (obj[c] && isValidRate(obj[c], c)) {
        applyRate(c, obj[c], source);
        got[c] = true;
      }
    });
  }

  function end() {
    if (finished) return;
    finished = true;
    rateFetching = false;
    if (el) el.style.opacity = '1';
    updateRatesUI();
    if (typeof showToast === 'function') {
      showToast(
        'دلار ' +
          rates.usd.toLocaleString('fa-IR') +
          ' | درهم ' +
          rates.aed.toLocaleString('fa-IR') +
          ' | لیر ' +
          rates.try.toLocaleString('fa-IR')
      );
    }
  }

  var tasks = [
    fromNavasanAll().then(function (o) {
      tryApply(o, 'بازار');
    }),
    fromNavasanRaw().then(function (o) {
      tryApply(o, 'بازار');
    }),
    fromJina('https://www.tgju.org/profile/price_dollar_rl', 'usd').then(function (o) {
      tryApply(o, 'tgju');
    }),
    fromJina('https://www.tgju.org/profile/price_aed', 'aed').then(function (o) {
      tryApply(o, 'tgju');
    })
  ];

  tasks.forEach(function (p) {
    p.catch(function () {});
  });

  Promise.allSettled(tasks).then(end);
  setTimeout(end, 5500);
}

// expose for calculator
window.rates = rates;
window.getActiveRate = getActiveRate;
window.getSelectedCurrency = getSelectedCurrency;

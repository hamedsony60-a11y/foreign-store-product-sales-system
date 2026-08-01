/* Fast USD/IRR rate — instant cache + parallel sources (max ~5s) */
var MIN_VALID_TOMAN = 150000;
var MAX_VALID_TOMAN = 500000;
var rateFetching = false;
var TGJU_PAGE = 'https://www.tgju.org/profile/price_dollar_rl';

function parseToToman(raw) {
  if (raw == null) return null;
  if (typeof raw === 'number') {
    if (raw > 1000000) return Math.round(raw / 10); // ریال → تومان
    return Math.round(raw);
  }
  var s = String(raw).replace(/[۰-۹]/g, function (d) {
    return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
  });
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
  if (typeof usdRate !== 'undefined') usdRate = toman;
  localStorage.setItem('usd_free_rate', String(toman));
  localStorage.setItem('usd_rate_source', source || 'tgju.org');
  localStorage.setItem('usd_rate_time', new Date().toISOString());
  var el = document.getElementById('usdRateDisplay');
  if (el) {
    var now = new Date();
    var time =
      now.getHours().toString().padStart(2, '0') +
      ':' +
      now.getMinutes().toString().padStart(2, '0');
    el.innerHTML =
      toman.toLocaleString('fa-IR') +
      ' تومان <small style="opacity:.75">(' +
      (source || 'tgju') +
      ' ' +
      time +
      ')</small>';
  }
  return true;
}

function showInstantRate() {
  var cached = Number(localStorage.getItem('usd_free_rate') || 0);
  if (isValidRate(cached)) {
    applyUsdRate(cached, localStorage.getItem('usd_rate_source') || 'کش');
  } else if (typeof usdRate !== 'undefined' && isValidRate(usdRate)) {
    applyUsdRate(usdRate, 'برآورد');
  } else {
    applyUsdRate(194200, 'برآورد');
  }
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

/** استخراج نرخ از متن صفحه tgju (ریال یا تومان) */
function extractTgjuRate(text) {
  if (!text) return null;
  // اعداد شبیه 1,942,000 (ریال) یا 194,200
  var re = /([0-9]{1,3}(?:,[0-9]{3}){2,3})/g;
  var m;
  var candidates = [];
  while ((m = re.exec(text)) !== null) {
    var t = parseToToman(m[1]);
    if (isValidRate(t)) candidates.push(t);
  }
  if (!candidates.length) return null;
  // پرتکرارترین عدد در بازه معتبر
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

function fromJinaTgju() {
  // jina.ai خواننده سریع صفحه tgju
  return fetchWithTimeout('https://r.jina.ai/' + TGJU_PAGE, 5000)
    .then(function (r) {
      return r.text();
    })
    .then(function (text) {
      var t = extractTgjuRate(text);
      if (!isValidRate(t)) throw new Error('parse');
      return { rate: t, source: 'tgju.org' };
    });
}

function fromJinaTgjuHttp() {
  return fetchWithTimeout('https://r.jina.ai/http://www.tgju.org/profile/price_dollar_rl', 5000)
    .then(function (r) {
      return r.text();
    })
    .then(function (text) {
      var t = extractTgjuRate(text);
      if (!isValidRate(t)) throw new Error('parse');
      return { rate: t, source: 'tgju.org' };
    });
}

function fromNavasan(url, label) {
  return fetchWithTimeout(url, 4000)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var v = data && data.usd && data.usd.value;
      var t = parseToToman(v);
      if (!isValidRate(t)) throw new Error('bad');
      return { rate: t, source: label || 'بازار' };
    });
}

/**
 * دکمه ↻ و بارگذاری صفحه
 * ۱) فوری کش
 * ۲) موازی: jina→tgju + navasan — هر کدام زودتر آمد همان
 * ۳) حداکثر ۵ ثانیه
 */
function fetchUsdRate() {
  if (rateFetching) return;
  rateFetching = true;
  showInstantRate();

  var el = document.getElementById('usdRateDisplay');
  if (el) el.style.opacity = '0.65';
  if (typeof showToast === 'function') showToast('در حال بروزرسانی نرخ...');

  var done = false;
  function finish(ok, rate, source) {
    if (done) return;
    done = true;
    rateFetching = false;
    if (el) el.style.opacity = '1';
    if (ok && applyUsdRate(rate, source)) {
      if (typeof showToast === 'function')
        showToast('نرخ: ' + rate.toLocaleString('fa-IR') + ' تومان');
    } else {
      showInstantRate();
      if (typeof showToast === 'function')
        showToast('نرخ آنلاین دیر شد — از آخرین نرخ استفاده شد');
    }
  }

  var tasks = [
    fromJinaTgju(),
    fromJinaTgjuHttp(),
    fromNavasan(
      'https://cdn.jsdelivr.net/gh/HosseinOdd/Navasan-API@main/data/fiat.json',
      'بازار'
    ),
    fromNavasan(
      'https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json',
      'بازار'
    )
  ];

  // اولین پاسخ معتبر برنده است
  tasks.forEach(function (p) {
    p.then(function (r) {
      if (r && isValidRate(r.rate)) finish(true, r.rate, r.source);
    }).catch(function () {});
  });

  // سقف ۵ ثانیه
  setTimeout(function () {
    finish(false);
  }, 5000);
}

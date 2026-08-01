/* Local full shop — products, cart, calculator, payment */
(function () {
  function loadSync(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      (0, eval)(xhr.responseText);
    } else {
      console.error('Load failed', url, xhr.status);
    }
  }
  loadSync('sp1.js');
  loadSync('sp2.js');
  loadSync('sp3.js');
})();

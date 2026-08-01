/* load shop + nav + search */
(function () {
  function loadSync(url) {
    var x = new XMLHttpRequest();
    x.open('GET', url, false);
    x.send(null);
    if (x.status >= 200 && x.status < 300) {
      (0, eval)(x.responseText);
    } else {
      console.error('fail', url, x.status);
    }
  }
  loadSync('shop1.js');
  loadSync('shop2.js');
  loadSync('nav.js');
  loadSync('search.js');
})();

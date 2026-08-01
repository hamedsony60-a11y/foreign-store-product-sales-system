/* Full shop — sync load parts so products work */
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
  loadSync('script_part1.js');
  loadSync('script_part2.js');
})();

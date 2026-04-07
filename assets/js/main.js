// Med-SEM one-page JS (year + theme toggle)

(function () {
  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme (Bootstrap 5.3 data-bs-theme)
  var root = document.documentElement;
  var toggleBtn = document.getElementById('themeToggle');

  function preferredTheme() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}

    // Update icon if exists
    var icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    if (icon) {
      icon.className = (theme === 'dark') ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
  }

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved || preferredTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-bs-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Blog: "Devamını oku" tekil çalışsın (bir kart açılınca diğerleri kapanır)
  document.addEventListener('DOMContentLoaded', function () {
    var blog = document.getElementById('blog');
    if (!blog) return;

    var detailsList = Array.prototype.slice.call(blog.querySelectorAll('details.blog-details'));
    if (!detailsList.length) return;

    // Blog kartlarını, tüm "Devamını oku" alanları kapalıyken aynı yüksekliğe eşitleyerek
    // grid görünümünü daha dengeli/premium hale getir.
    function equalizeBlogCards() {
      var cards = Array.prototype.slice.call(blog.querySelectorAll('.blog-card'));
      if (!cards.length) return;

      // Ölçüm için: açık olan details'ları geçici olarak kapat (sonra geri açacağız)
      var openStates = detailsList.map(function (d) { return !!d.open; });
      detailsList.forEach(function (d) { d.removeAttribute('open'); });

      // Önce sıfırla, sonra max yüksekliği bul
      cards.forEach(function (c) { c.style.minHeight = ''; });

      // Bir sonraki frame'de ölç (layout otursun)
      requestAnimationFrame(function () {
        var maxH = 0;
        cards.forEach(function (c) {
          var h = c.getBoundingClientRect().height;
          if (h > maxH) maxH = h;
        });
        maxH = Math.ceil(maxH);
        cards.forEach(function (c) { c.style.minHeight = maxH + 'px'; });

        // Önceki open durumunu geri yükle
        detailsList.forEach(function (d, i) {
          if (openStates[i]) d.setAttribute('open', '');
        });
      });
    }

    // İlk yüklemede ve resize'da çalıştır
    var resizeTimer = null;
    function scheduleEqualize() {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(equalizeBlogCards, 60);
    }

    // DOM hazır olduğunda hızlı bir kez, tam yüklemede bir kez daha
    scheduleEqualize();
    window.addEventListener('load', scheduleEqualize);
    window.addEventListener('resize', scheduleEqualize);

    detailsList.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        detailsList.forEach(function (other) {
          if (other !== d) other.removeAttribute('open');
        });

        // Aç/kapat sonrası layout değişebilir; yükseklikleri yeniden eşitle
        scheduleEqualize();
      });
    });
  });
})();
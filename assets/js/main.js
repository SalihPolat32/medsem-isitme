// Med-SEM one-page JS (year + theme toggle)

(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Theme (Bootstrap 5.3 data-bs-theme)
  var root = document.documentElement;
  var toggleBtn = document.getElementById("themeToggle");

  function preferredTheme() {
    try {
      return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    } catch (e) {
      return "light";
    }
  }

  function updateThemeIcon(theme) {
    if (!toggleBtn) return;

    var icon = toggleBtn.querySelector("i");
    if (!icon) return;

    icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  }

  function applyTheme(theme) {
    var nextTheme = theme === "dark" ? "dark" : "light";

    root.setAttribute("data-bs-theme", nextTheme);

    try {
      localStorage.setItem("theme", nextTheme);
    } catch (e) {}

    updateThemeIcon(nextTheme);
  }

  function initTheme() {
    var saved = null;

    try {
      saved = localStorage.getItem("theme");
    } catch (e) {}

    applyTheme(saved || preferredTheme());
  }

  function bindThemeToggle() {
    if (!toggleBtn || toggleBtn.dataset.themeBound === "1") return;

    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-bs-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });

    toggleBtn.dataset.themeBound = "1";
  }

  function initBlogAccordion() {
    var blog = document.getElementById("blog");
    if (!blog) return;

    var detailsList = Array.prototype.slice.call(
        blog.querySelectorAll("details.blog-details")
    );

    if (!detailsList.length) return;

    function equalizeBlogCards() {
      var cards = Array.prototype.slice.call(blog.querySelectorAll(".blog-card"));
      if (!cards.length) return;

      var openStates = detailsList.map(function (d) {
        return !!d.open;
      });

      detailsList.forEach(function (d) {
        d.removeAttribute("open");
      });

      cards.forEach(function (c) {
        c.style.minHeight = "";
      });

      requestAnimationFrame(function () {
        var maxH = 0;

        cards.forEach(function (c) {
          var h = c.getBoundingClientRect().height;
          if (h > maxH) maxH = h;
        });

        maxH = Math.ceil(maxH);

        cards.forEach(function (c) {
          c.style.minHeight = maxH + "px";
        });

        detailsList.forEach(function (d, i) {
          if (openStates[i]) {
            d.setAttribute("open", "");
          }
        });
      });
    }

    var resizeTimer = null;

    function scheduleEqualize() {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(equalizeBlogCards, 60);
    }

    scheduleEqualize();
    window.addEventListener("load", scheduleEqualize);
    window.addEventListener("resize", scheduleEqualize);

    detailsList.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;

        detailsList.forEach(function (other) {
          if (other !== d) {
            other.removeAttribute("open");
          }
        });

        scheduleEqualize();
      });
    });
  }

  function init() {
    initTheme();
    bindThemeToggle();
    initBlogAccordion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      if (char === "&") {
        return "&amp;";
      }
      if (char === "<") {
        return "&lt;";
      }
      if (char === ">") {
        return "&gt;";
      }
      if (char === '"') {
        return "&quot;";
      }
      return "&#39;";
    });
  }

  function initMobileNav() {
    var toggle = qs("[data-nav-toggle]");
    var panel = qs("[data-mobile-nav]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa("[data-hero-slide]", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function step(direction) {
      show(index + direction);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        step(1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        step(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        step(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initPageFilter() {
    var input = qs("[data-page-filter]");
    var cards = qsa("[data-card-keywords]");
    var chips = qsa("[data-filter-chip]");
    var activeFilter = "all";
    if (!cards.length) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var keys = (card.getAttribute("data-card-keywords") || "").toLowerCase();
        var filterValue = (card.getAttribute("data-filter-values") || "").toLowerCase();
        var queryMatch = !query || keys.indexOf(query) > -1;
        var chipMatch = activeFilter === "all" || filterValue.indexOf(activeFilter) > -1;
        card.classList.toggle("is-hidden-card", !(queryMatch && chipMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = (chip.getAttribute("data-filter-chip") || "all").toLowerCase();
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });
  }

  function renderSearchCard(movie) {
    return '<a class="movie-card" href="./' + safeText(movie.url) + '">' +
      '<div class="poster">' +
      '<img src="./' + safeText(movie.cover) + '" alt="' + safeText(movie.title) + '" loading="lazy">' +
      '<div class="card-badges"><span class="card-badge glow">' + safeText(movie.region) + '</span><span class="card-badge">' + safeText(movie.year) + '</span></div>' +
      '<div class="play-float"><span>▶</span></div>' +
      '<div class="card-copy"><h3>' + safeText(movie.title) + '</h3><p>' + safeText(movie.genre) + '</p></div>' +
      '</div></a>';
  }

  function initSearchPage() {
    var grid = qs("[data-search-results]");
    var title = qs("[data-search-title]");
    var input = qs("[data-search-input]");
    if (!grid || !window.STELLAR_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      if (title) {
        title.textContent = q ? "搜索：" + query.trim() : "搜索剧集";
      }
      if (!q) {
        grid.innerHTML = '<div class="search-empty">输入片名、地区、年份、类型或标签即可查找内容。</div>';
        return;
      }
      var results = window.STELLAR_SEARCH_INDEX.filter(function (movie) {
        return movie.keys.indexOf(q) > -1;
      }).slice(0, 120);
      if (!results.length) {
        grid.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
        return;
      }
      grid.innerHTML = results.map(renderSearchCard).join("");
    }

    render(initialQuery);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initPageFilter();
    initSearchPage();
  });
})();

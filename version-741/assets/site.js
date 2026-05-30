(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var next = slider.querySelector(".hero-next");
    var prev = slider.querySelector(".hero-prev");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var target = panel.getAttribute("data-filter-target") || "#movie-grid";
      var grid = document.querySelector(target);
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var search = panel.querySelector(".movie-search");
      var year = panel.querySelector(".year-filter");
      var type = panel.querySelector(".type-filter");
      var empty = document.querySelector(".empty-state");

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) ok = false;
          if (y && card.getAttribute("data-year") !== y) ok = false;
          if (t && card.getAttribute("data-type") !== t) ok = false;
          card.classList.toggle("is-hidden", !ok);
          if (ok) visible += 1;
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type].forEach(function (el) {
        if (!el) return;
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
        apply();
      }
    });
  }

  window.initMoviePlayer = function (mediaUrl) {
    ready(function () {
      var shell = document.querySelector(".player-shell");
      var video = document.querySelector(".video-player");
      var overlay = document.querySelector(".player-overlay");
      if (!shell || !video || !mediaUrl) return;
      var attached = false;

      function attach() {
        if (attached) return;
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }
      }

      function start() {
        attach();
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  };

  ready(function () {
    initMenu();
    initHeroSlider();
    initFilters();
  });
})();

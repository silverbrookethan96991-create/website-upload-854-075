(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var scope = form.parentElement || document;
      var input = form.querySelector('[data-filter-input]');
      var year = form.querySelector('[data-year-filter]');
      var category = form.querySelector('[data-category-filter]');
      var items = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-item]'));
      var empty = scope.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var yearValue = normalize(year ? year.value : '');
        var categoryValue = normalize(category ? category.value : '');
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize(item.getAttribute('data-search'));
          var itemYear = normalize(item.getAttribute('data-year'));
          var itemCategory = normalize(item.getAttribute('data-category'));
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }

          if (yearValue && itemYear !== yearValue) {
            ok = false;
          }

          if (categoryValue && itemCategory !== categoryValue) {
            ok = false;
          }

          item.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = video ? video.getAttribute('data-src') : '';
      var attached = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attachSource();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();

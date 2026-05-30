(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = $('[data-menu-button]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initBackToTop() {
    var button = $('[data-back-to-top]');

    if (!button) {
      return;
    }

    function updateVisibility() {
      button.classList.toggle('is-visible', window.scrollY > 480);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  function initHeroCarousel() {
    var carousel = $('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var previous = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function markMissingImages() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function initSearchPage() {
    var root = $('[data-search-page]');

    if (!root || !window.MOVIE_DATA) {
      return;
    }

    var form = $('[data-search-form]', root);
    var queryInput = $('[data-search-query]', root);
    var typeSelect = $('[data-search-type]', root);
    var regionSelect = $('[data-search-region]', root);
    var status = $('[data-search-status]', root);
    var results = $('[data-search-results]', root);
    var params = new URLSearchParams(window.location.search);

    queryInput.value = params.get('q') || '';
    typeSelect.value = params.get('type') || '';
    regionSelect.value = params.get('region') || '';

    function card(movie) {
      return [
        '<article class="movie-card movie-card--normal">',
        '  <a class="movie-card-link" href="' + movie.detailPath + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-frame">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <div class="poster-shade"></div>',
        '      <span class="play-chip">▶</span>',
        '      <div class="card-meta-top">',
        '        <span>' + escapeHtml(movie.regionGroup) + '</span>',
        '        <span>' + escapeHtml(movie.yearText) + '</span>',
        '      </div>',
        '      <div class="card-copy">',
        '        <h3>' + escapeHtml(movie.title) + '</h3>',
        '        <p>' + escapeHtml(movie.genreRaw) + '</p>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function getText(movie) {
      return [
        movie.title,
        movie.region,
        movie.regionGroup,
        movie.type,
        movie.genreRaw,
        movie.tags.join(' '),
        movie.oneLine,
        movie.summary,
        movie.review,
        movie.yearText
      ].join(' ').toLowerCase();
    }

    function render() {
      var query = queryInput.value.trim().toLowerCase();
      var selectedType = typeSelect.value;
      var selectedRegion = regionSelect.value;
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var ok = true;

        if (query) {
          ok = getText(movie).indexOf(query) !== -1;
        }

        if (ok && selectedType) {
          ok = movie.type === selectedType;
        }

        if (ok && selectedRegion) {
          ok = movie.regionGroup === selectedRegion;
        }

        return ok;
      });

      status.textContent = '找到 ' + matched.length + ' 条结果，当前展示前 120 条。';
      results.innerHTML = matched.slice(0, 120).map(card).join('');
      markMissingImages();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextParams = new URLSearchParams();

      if (queryInput.value.trim()) {
        nextParams.set('q', queryInput.value.trim());
      }

      if (typeSelect.value) {
        nextParams.set('type', typeSelect.value);
      }

      if (regionSelect.value) {
        nextParams.set('region', regionSelect.value);
      }

      var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
      window.history.replaceState(null, '', nextUrl);
      render();
    });

    queryInput.addEventListener('input', render);
    typeSelect.addEventListener('change', render);
    regionSelect.addEventListener('change', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initBackToTop();
    initHeroCarousel();
    initSearchPage();
    markMissingImages();
  });
}());

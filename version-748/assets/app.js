(function () {
  var menuButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  startHero();

  var liveFilter = document.querySelector('.live-filter');
  var searchGrid = document.querySelector('.searchable-grid');

  if (liveFilter && searchGrid) {
    var searchInput = liveFilter.querySelector('.search-input');
    var selectInput = liveFilter.querySelector('.filter-select');
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    if (searchInput) {
      searchInput.value = queryValue;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var term = normalize(searchInput ? searchInput.value : '');
      var selectedType = normalize(selectInput ? selectInput.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var typeValue = normalize(card.getAttribute('data-type'));
        var matchText = !term || haystack.indexOf(term) !== -1;
        var matchType = !selectedType || typeValue.indexOf(selectedType) !== -1;
        card.classList.toggle('is-filtered-out', !(matchText && matchType));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (selectInput) {
      selectInput.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
}());

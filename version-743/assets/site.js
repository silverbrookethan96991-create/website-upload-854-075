document.addEventListener('DOMContentLoaded', function () {
    initializeMobileMenu();
    initializeHeroCarousel();
    initializeCategoryFilters();
    initializeSearchPage();
    initializePlayers();
});

function initializeMobileMenu() {
    var toggle = document.querySelector('[data-mobile-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
    });
}

function initializeHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
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
            timer = null;
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
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
            var dotIndex = Number(dot.getAttribute('data-hero-dot'));
            showSlide(dotIndex);
            startTimer();
        });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);

    showSlide(0);
    startTimer();
}

function initializeCategoryFilters() {
    var form = document.querySelector('[data-filter-form]');
    var grid = document.querySelector('[data-movie-grid]');
    var counter = document.querySelector('[data-filter-count]');

    if (!form || !grid) {
        return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var keywordInput = form.querySelector('[data-filter-keyword]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var regionSelect = form.querySelector('[data-filter-region]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (year && normalize(card.getAttribute('data-year')) !== year) {
                matched = false;
            }

            if (type && normalize(card.getAttribute('data-type')) !== type) {
                matched = false;
            }

            if (region && normalize(card.getAttribute('data-region')) !== region) {
                matched = false;
            }

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    applyFilters();
}

function initializeSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var input = document.querySelector('[data-search-input]');

    if (!results || !summary || !window.MOVIE_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
        input.value = query;
    }

    renderSearchResults(query);

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function createCard(movie) {
        var tagText = Array.isArray(movie.tags) ? movie.tags.join(',') : '';
        return [
            '<a class="movie-card" href="' + escapeAttribute(movie.url) + '" data-movie-card data-title="' + escapeAttribute(movie.title) + '" data-year="' + escapeAttribute(movie.year) + '" data-region="' + escapeAttribute(movie.region) + '" data-type="' + escapeAttribute(movie.type) + '" data-genre="' + escapeAttribute(movie.genre) + '" data-tags="' + escapeAttribute(tagText) + '">',
            '    <figure class="movie-cover">',
            '        <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">',
            '        <span class="cover-shade"></span>',
            '        <span class="play-chip">▶</span>',
            '    </figure>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHTML(movie.title) + '</h3>',
            '        <p class="movie-card-meta">' + escapeHTML(movie.year) + ' · ' + escapeHTML(movie.region) + ' · ' + escapeHTML(movie.type) + '</p>',
            '        <p class="movie-card-genre">' + escapeHTML(movie.genre) + '</p>',
            '    </div>',
            '</a>'
        ].join('\n');
    }

    function renderSearchResults(rawQuery) {
        var cleanQuery = normalize(rawQuery);

        if (!cleanQuery) {
            summary.textContent = '请输入关键词开始搜索。';
            results.innerHTML = '';
            return;
        }

        var matches = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                movie.category,
                Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
            ].join(' '));
            return haystack.indexOf(cleanQuery) !== -1;
        });

        summary.textContent = '“' + rawQuery + '” 共找到 ' + matches.length + ' 部影片';
        results.innerHTML = matches.slice(0, 300).map(createCard).join('\n');

        if (matches.length > 300) {
            summary.textContent += '，当前显示前 300 部';
        }
    }
}

function initializePlayers() {
    var playerBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));

    playerBoxes.forEach(function (box) {
        var video = box.querySelector('video[data-hls-src]');
        var startButton = box.querySelector('[data-player-start]');
        var hlsInstance = null;
        var initialized = false;

        if (!video) {
            return;
        }

        function initializeSource() {
            var source = video.getAttribute('data-hls-src');

            if (initialized || !source) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            initializeSource();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            box.classList.remove('is-playing');
        });

        video.addEventListener('emptied', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
    return escapeHTML(value).replace(/`/g, '&#096;');
}

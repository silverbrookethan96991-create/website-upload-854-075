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
                panel.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });

            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var queryInput = document.querySelector('[data-query-input]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (queryInput && query) {
            queryInput.value = query;
        }

        document.querySelectorAll('[data-filter-list]').forEach(function (list) {
            var root = list.closest('main') || document;
            var input = root.querySelector('[data-filter-input]');
            var select = root.querySelector('[data-filter-select]');
            var items = Array.prototype.slice.call(list.querySelectorAll('[data-search-item]'));

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function filterItems() {
                var keyword = normalize(input ? input.value : '');
                var year = normalize(select ? select.value : '');

                items.forEach(function (item) {
                    var text = normalize(item.getAttribute('data-title') + ' ' + item.getAttribute('data-meta') + ' ' + item.textContent);
                    var passKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var passYear = !year || text.indexOf(year) !== -1;
                    item.classList.toggle('is-hidden', !(passKeyword && passYear));
                });
            }

            if (input) {
                input.addEventListener('input', filterItems);
            }

            if (select) {
                select.addEventListener('change', filterItems);
            }

            filterItems();
        });
    });
})();

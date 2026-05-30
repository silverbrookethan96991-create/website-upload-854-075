(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");

        if (menuToggle && nav) {
            menuToggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                thumbs.forEach(function (thumb, i) {
                    thumb.classList.toggle("active", i === index);
                });
            }

            function startTimer() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(index + 1);
                }, 5500);
            }

            thumbs.forEach(function (thumb) {
                thumb.addEventListener("click", function () {
                    var nextIndex = Number(thumb.getAttribute("data-hero-thumb"));
                    showSlide(nextIndex);
                    startTimer();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    startTimer();
                });
            }

            showSlide(0);
            startTimer();
        }

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function filterCards(value) {
            var query = String(value || "").trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || card.textContent || "";
                var matched = !query || text.toLowerCase().indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("visible", visible === 0);
            }
        }

        if (filterInputs.length && cards.length) {
            filterInputs.forEach(function (input) {
                if (initialQuery) {
                    input.value = initialQuery;
                }
                input.addEventListener("input", function () {
                    filterCards(input.value);
                });
            });
            filterCards(initialQuery);
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            window.addEventListener("scroll", function () {
                backTop.classList.toggle("visible", window.scrollY > 560);
            }, { passive: true });

            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    });
})();

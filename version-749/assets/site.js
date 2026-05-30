(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", function() {
            clearInterval(timer);
        });

        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilterPanels() {
        document.querySelectorAll("[data-filter-panel], [data-search-page]").forEach(function(panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var list = document.querySelector("[data-card-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var typeValue = normalize(type && type.value);
                cards.forEach(function(card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    card.style.display = matchKeyword && matchYear && matchType ? "" : "none";
                });
            }

            [input, year, type].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (panel.hasAttribute("data-search-page") && input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
            }
            apply();
        });
    }

    function hlsClass() {
        return window.StaticHls || window.Hls || null;
    }

    function waitForHls(callback) {
        if (hlsClass()) {
            callback();
            return;
        }
        var done = false;
        function finish() {
            if (done) {
                return;
            }
            done = true;
            callback();
        }
        window.addEventListener("hls-ready", finish, { once: true });
        window.setTimeout(finish, 1200);
    }

    function attachSource(video, source) {
        return new Promise(function(resolve) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                resolve();
                return;
            }
            waitForHls(function() {
                var Hls = hlsClass();
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    if (video.__hlsInstance) {
                        video.__hlsInstance.destroy();
                    }
                    var instance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    video.__hlsInstance = instance;
                    instance.loadSource(source);
                    instance.attachMedia(video);
                    instance.on(Hls.Events.MANIFEST_PARSED, function() {
                        resolve();
                    });
                    instance.on(Hls.Events.ERROR, function() {
                        resolve();
                    });
                } else {
                    video.src = source;
                    resolve();
                }
            });
        });
    }

    window.bindMoviePlayer = function(options) {
        var video = document.querySelector(options.selector);
        var button = document.querySelector(options.buttonSelector);
        if (!video || !button || !options.source) {
            return;
        }
        if (options.poster) {
            video.setAttribute("poster", options.poster);
        }
        var loaded = false;

        function start() {
            button.classList.add("is-hidden");
            if (!loaded) {
                loaded = true;
                attachSource(video, options.source).then(function() {
                    video.play().catch(function() {
                        button.classList.remove("is-hidden");
                    });
                });
            } else {
                video.play().catch(function() {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("play", function() {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function() {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };

    ready(function() {
        initMobileMenu();
        initHero();
        initFilterPanels();
    });
})();

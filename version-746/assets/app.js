(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (menuButton && panel) {
      menuButton.addEventListener("click", function() {
        panel.classList.toggle("is-open");
        menuButton.classList.toggle("is-open");
      });
    }

    var scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      scrollTop.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      window.addEventListener("scroll", function() {
        if (window.scrollY > 480) {
          scrollTop.classList.add("is-visible");
        } else {
          scrollTop.classList.remove("is-visible");
        }
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
      if (slides.length > 1) {
        var timer = window.setInterval(function() {
          show(index + 1);
        }, 5000);
        function move(step) {
          window.clearInterval(timer);
          show(index + step);
          timer = window.setInterval(function() {
            show(index + 1);
          }, 5000);
        }
        if (prev) {
          prev.addEventListener("click", function() {
            move(-1);
          });
        }
        if (next) {
          next.addEventListener("click", function() {
            move(1);
          });
        }
        dots.forEach(function(dot, i) {
          dot.addEventListener("click", function() {
            window.clearInterval(timer);
            show(i);
            timer = window.setInterval(function() {
              show(index + 1);
            }, 5000);
          });
        });
      }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function(panel) {
      var section = panel.parentElement;
      var grid = section ? section.querySelector("[data-card-grid]") : null;
      if (!grid) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var reset = panel.querySelector("[data-filter-reset]");
      var empty = panel.querySelector("[data-no-result]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".video-card"));
      var types = [];
      var years = [];
      cards.forEach(function(card) {
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        if (type && types.indexOf(type) === -1) {
          types.push(type);
        }
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
      });
      types.sort().forEach(function(type) {
        var option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
      years.sort(function(a, b) {
        return String(b).localeCompare(String(a));
      }).forEach(function(year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input && !input.value) {
        input.value = q;
      }
      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;
        cards.forEach(function(card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var okText = !text || haystack.indexOf(text) !== -1;
          var okType = !type || card.getAttribute("data-type") === type;
          var okYear = !year || card.getAttribute("data-year") === year;
          var ok = okText && okType && okYear;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [input, typeSelect, yearSelect].forEach(function(node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function() {
          if (input) {
            input.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          apply();
        });
      }
      apply();
    });
  });
}());

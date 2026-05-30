(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var layer = player.querySelector(".play-layer");
            var stream = player.getAttribute("data-stream") || "";
            var started = false;
            var hls = null;

            function attachStream() {
                if (!video || !stream || started) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }

                started = true;
            }

            function begin() {
                if (!video) {
                    return;
                }

                attachStream();
                video.controls = true;

                if (layer) {
                    layer.classList.add("is-hidden");
                }

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (layer) {
                layer.addEventListener("click", begin);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        begin();
                    }
                });
                video.addEventListener("play", function () {
                    if (layer) {
                        layer.classList.add("is-hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();

function initHlsPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var streamUrl = config.streamUrl;
    var isReady = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (isReady) {
            return;
        }

        isReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function start() {
        attachStream();
        overlay.classList.add('is-hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

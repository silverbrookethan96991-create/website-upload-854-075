function initStellarPlayer(sourceUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var hlsInstance = null;
  var ready = false;

  if (!video) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
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
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}

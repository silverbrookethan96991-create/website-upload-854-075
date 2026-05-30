(function () {
  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  function loadNative(video, source, shell) {
    video.src = source;
    video.play().then(function () {
      shell.classList.add('is-playing');
      setStatus(shell, '正在使用浏览器原生 HLS 播放。');
    }).catch(function () {
      setStatus(shell, '浏览器阻止了自动播放，请再次点击播放按钮。');
    });
  }

  function loadWithHls(video, source, shell) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().then(function () {
        shell.classList.add('is-playing');
        setStatus(shell, 'HLS 播放源已加载，正在播放。');
      }).catch(function () {
        setStatus(shell, '播放源已加载，请再次点击播放按钮。');
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(shell, '播放源加载失败，可刷新页面后重试。');
        hls.destroy();
      }
    });

    shell._hls = hls;
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-src');

    if (!video || !source) {
      setStatus(shell, '未找到可用播放源。');
      return;
    }

    if (shell.classList.contains('is-playing')) {
      video.play();
      return;
    }

    setStatus(shell, '正在加载播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      loadNative(video, source, shell);
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      loadWithHls(video, source, shell);
      return;
    }

    loadNative(video, source, shell);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
      var button = shell.querySelector('[data-player-button]');

      if (button) {
        button.addEventListener('click', function () {
          startPlayer(shell);
        });
      }
    });
  });
}());

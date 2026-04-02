// ============================================================
// VIDEO PREVIEW MANAGER
// Auto-play muted video previews on recipe cards using
// IntersectionObserver + Cloudflare Stream HLS
// ============================================================

(function() {
  let observer = null;
  let activeVideo = null;   // currently playing <video> element
  let activeHls = null;     // hls.js instance for active video (if any)

  // Attach HLS source to a <video> element
  function attachHLS(video, hlsUrl) {
    // Safari/iOS: native HLS support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      return null;
    }
    // Chrome/Firefox: use hls.js polyfill
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false, lowLatencyMode: false });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      return hls;
    }
    // Fallback: try direct (won't work for HLS but graceful fail)
    video.src = hlsUrl;
    return null;
  }

  // Stop and clean up a video element
  function stopVideo(video, hls) {
    if (!video) return;
    video.pause();
    if (hls) {
      hls.destroy();
    }
    video.removeAttribute('src');
    video.load();
    const card = video.closest('.video-card');
    if (card) card.classList.remove('playing');
  }

  // Start playing a video card
  function startVideo(card) {
    const video = card.querySelector('video[data-video-preview]');
    if (!video) return;

    const videoId = video.dataset.videoPreview;
    if (!videoId) return;

    // Stop any currently playing video
    if (activeVideo && activeVideo !== video) {
      stopVideo(activeVideo, activeHls);
      activeHls = null;
      activeVideo = null;
    }

    const hlsUrl = getStreamHLSUrl(videoId);
    activeHls = attachHLS(video, hlsUrl);
    activeVideo = video;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.then(() => {
        card.classList.add('playing');
      }).catch(() => {
        // Auto-play blocked or error — keep thumbnail visible
        card.classList.remove('playing');
      });
    }
  }

  // Initialize (or re-initialize) the IntersectionObserver
  window.initVideoPreviewObserver = function() {
    // Clean up previous observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (activeVideo) {
      stopVideo(activeVideo, activeHls);
      activeVideo = null;
      activeHls = null;
    }

    const cards = document.querySelectorAll('[data-video-card]');
    if (cards.length === 0) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const card = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          startVideo(card);
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
          const video = card.querySelector('video[data-video-preview]');
          if (video && video === activeVideo) {
            stopVideo(activeVideo, activeHls);
            activeVideo = null;
            activeHls = null;
          }
        }
      });
    }, {
      threshold: [0, 0.3, 0.6, 1],
      rootMargin: '50px 0px'
    });

    cards.forEach(card => observer.observe(card));
  };

  // Cleanup
  window.destroyVideoPreviewObserver = function() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (activeVideo) {
      stopVideo(activeVideo, activeHls);
      activeVideo = null;
      activeHls = null;
    }
  };
})();

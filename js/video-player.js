/* Reproductor de referencias bajo demanda.
   YouTube no se contacta hasta que la persona activa uno de los botones. */
(function () {
  'use strict';

  var registry = window.EST_REFERENCE_VIDEOS;
  var modal = null;
  var modalFrame = null;
  var modalTitle = null;
  var modalAuthor = null;
  var modalSource = null;
  var modalFallback = null;
  var closeButton = null;
  var lastTrigger = null;

  function items() {
    return registry && registry.items ? registry.items : {};
  }

  function buildEmbedUrl(videoId) {
    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) +
      '?rel=0&autoplay=1&modestbranding=1';
  }

  function createIframe(video, onError) {
    var iframe = document.createElement('iframe');
    iframe.src = buildEmbedUrl(video.youtubeId);
    iframe.title = video.title + ' — ' + video.author;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.className = 'reference-video-iframe';
    iframe.setAttribute('allowfullscreen', '');
    if (onError) iframe.addEventListener('error', onError);
    return iframe;
  }

  function setFallback(node, visible) {
    if (!node) return;
    node.hidden = !visible;
  }

  function openInlineVideo(key, trigger) {
    var video = items()[key];
    var shell = trigger && trigger.closest('[data-video-shell]');
    var frame = shell && shell.querySelector('[data-video-frame]');
    var fallback = shell && shell.querySelector('[data-video-fallback]');
    if (!video || !frame) return;

    try {
      var iframe = createIframe(video, function () {
        frame.replaceChildren();
        setFallback(fallback, true);
      });
      setFallback(fallback, false);
      frame.replaceChildren(iframe);
      trigger.setAttribute('aria-expanded', 'true');
    } catch (_error) {
      frame.replaceChildren();
      setFallback(fallback, true);
    }
  }

  function focusableInModal() {
    if (!modal) return [];
    return Array.prototype.slice.call(
      modal.querySelectorAll('button, [href], iframe, [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) {
      return !node.disabled && !node.hidden;
    });
  }

  function openStoryVideo(key, trigger) {
    var video = items()[key];
    if (!video || !modal || !modalFrame) return;

    lastTrigger = trigger || null;
    modalTitle.textContent = video.title;
    modalAuthor.textContent = video.author;
    modalSource.setAttribute('href', video.sourceUrl);
    modalSource.setAttribute('target', '_blank');
    modalSource.setAttribute('rel', 'noopener noreferrer');
    setFallback(modalFallback, false);

    try {
      modalFrame.replaceChildren(createIframe(video, function () {
        modalFrame.replaceChildren();
        setFallback(modalFallback, true);
      }));
    } catch (_error) {
      modalFrame.replaceChildren();
      setFallback(modalFallback, true);
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-video-open');
    if (closeButton) {
      setTimeout(function () {
        if (modal && modal.classList.contains('open')) closeButton.focus();
      }, 0);
    }
  }

  function closeStoryVideo() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalFrame) modalFrame.replaceChildren();
    setFallback(modalFallback, false);
    document.body.classList.remove('is-video-open');
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  }

  function handleModalKeys(event) {
    if (!modal || !modal.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeStoryVideo();
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = focusableInModal();
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function init() {
    if (!registry || !registry.items) return;
    modal = document.querySelector('[data-video-modal]');
    if (modal) {
      modalFrame = modal.querySelector('[data-video-frame]');
      modalTitle = modal.querySelector('[data-video-modal-title]');
      modalAuthor = modal.querySelector('[data-video-modal-author]');
      modalSource = modal.querySelector('[data-video-source]');
      modalFallback = modal.querySelector('[data-video-fallback]');
      closeButton = modal.querySelector('[data-video-close]');
      if (closeButton) closeButton.addEventListener('click', closeStoryVideo);
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeStoryVideo();
      });
    }

    document.querySelectorAll('[data-video-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var key = trigger.dataset.videoTrigger;
        if (key === 'main') openInlineVideo(key, trigger);
        else openStoryVideo(key, trigger);
      });
    });
    document.addEventListener('keydown', handleModalKeys);
  }

  window.ESTVideoPlayer = Object.freeze({
    buildEmbedUrl: buildEmbedUrl,
    openStoryVideo: openStoryVideo,
    closeStoryVideo: closeStoryVideo
  });

  document.addEventListener('DOMContentLoaded', init);
})();

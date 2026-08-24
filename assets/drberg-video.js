(function() {
  function initVideoModal(sectionId) {
    const trigger = document.getElementById('VideoTrigger-' + sectionId);
    const modal = document.getElementById('VideoModal-' + sectionId);
    const closeBtn = document.getElementById('VideoModalClose-' + sectionId);
    const deferredMedia = modal ? modal.querySelector('deferred-media') : null;

    if (!trigger || !modal || !deferredMedia) return;
    if (trigger.dataset.initialized) return;
    trigger.dataset.initialized = 'true';

    // Читаем настройки из data-атрибутов
    const enableLoop = trigger.dataset.enableLoop === 'true';
    const videoId = trigger.dataset.videoId;
    const posterBtn = deferredMedia.querySelector('.deferred-media__poster');

    function openModal() {
      // Используем BEM-модификатор вместо хвостов Tailwind
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      const iframe = deferredMedia.querySelector('iframe');
      const nativeVideo = deferredMedia.querySelector('video');

      if (iframe) {
        let src = iframe.src;
        src = src.replace(/[?&]autoplay=\d/g, '');
        src = src.replace(/[?&]loop=\d/g, '');
        src = src.replace(/[?&]playlist=[^&]*/g, '');
        const separator = src.includes('?') ? '&' : '?';
        src += separator + 'autoplay=1';
        if (enableLoop) {
          src += '&loop=1&playlist=' + videoId;
        }
        iframe.src = src;
      } else if (nativeVideo) {
        nativeVideo.play().catch(() => {});
      } else {
        if (typeof deferredMedia.loadContent === 'function') {
          deferredMedia.loadContent();
        } else if (posterBtn) {
          posterBtn.click();
        }
      }
    }

    function closeModal() {
      modal.classList.remove('is-open');
      
      setTimeout(() => {
        document.body.style.overflow = '';

        const iframe = deferredMedia.querySelector('iframe');
        const nativeVideo = deferredMedia.querySelector('video');

        if (iframe) {
          let src = iframe.src;
          src = src.replace(/[?&]autoplay=\d/g, '');
          src = src.replace(/[?&]loop=\d/g, '');
          src = src.replace(/[?&]playlist=[^&]*/g, '');
          const separator = src.includes('?') ? '&' : '?';
          src += separator + 'autoplay=0';
          iframe.src = src;
        } else if (nativeVideo) {
          nativeVideo.pause();
        }
      }, 300); // Задержка для анимации прозрачности
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[id^="VideoTrigger-"]').forEach(function(el) {
      const sectionId = el.id.replace('VideoTrigger-', '');
      initVideoModal(sectionId);
    });
  });

  document.addEventListener('shopify:section:load', function(e) {
    const section = e.target;
    const trigger = section.querySelector('[id^="VideoTrigger-"]');
    if (trigger) {
      const sectionId = trigger.id.replace('VideoTrigger-', '');
      initVideoModal(sectionId);
    }
  });
})();
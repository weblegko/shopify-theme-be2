document.addEventListener('DOMContentLoaded', function() {
  // Получаем Liquid переменные, переданные из сниппета
  const galleryConfig = window.drbergGalleryConfig || {};
  const productTitle = galleryConfig.productTitle || '';

  let currentIndex = 0;
  let isZoomed = false;
  let lightboxSwiper = null;
  let mainSwiper = null;
  let thumbSwiper = null;

  // Получаем видимые медиа (учитывая hide_variants)
  function getVisibleMediaData() {
    const slides = document.querySelectorAll('.main-swiper .swiper-slide:not(.thumbnail-list_item--variant)');
    return Array.from(slides).map(slide => ({
      id: slide.dataset.mediaId,
      type: slide.dataset.mediaType,
      alt: slide.querySelector('img')?.alt || productTitle, // Заменили {{ product.title | json }}
      index: parseInt(slide.dataset.index)
    }));
  }

  // ==========================================
  // SWIPER ГАЛЛЕРЕЯ
  // ==========================================
  function initGallerySwiper() {
    if (typeof Swiper === 'undefined') { setTimeout(initGallerySwiper, 100); return; }

    mainSwiper = new Swiper('.main-swiper', { slidesPerView: 1, spaceBetween: 8 });
    thumbSwiper = new Swiper('.thumb-swiper', {
      slidesPerView: 5, spaceBetween: 8,
      navigation: { nextEl: '.thumb-btn-next', prevEl: '.thumb-btn-prev' },
      breakpoints: {
        0: { slidesPerView: 4, spaceBetween: 8 },
        768: { slidesPerView: 3, spaceBetween: 16 },
        1024: { slidesPerView: 4, spaceBetween: 16 },
        1280: { slidesPerView: 5, spaceBetween: 16 },
      },
    });

    mainSwiper.params.thumbs = { swiper: thumbSwiper };
    mainSwiper.thumbs.init();

    // Клик по тумбнейлу
    document.querySelectorAll('.thumb-swiper .swiper-slide').forEach(function(slide) {
      slide.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        const targetSlide = document.querySelector(`.main-swiper .swiper-slide[data-index="${index}"]`);
        if (targetSlide && mainSwiper) {
           mainSwiper.slideTo(Array.from(mainSwiper.slides).indexOf(targetSlide), 300);
        }
      });
    });

    // Клик по главному слайдеру -> Лайтбокс
    document.querySelectorAll('.main-swiper .swiper-slide').forEach(function(slide) {
      slide.addEventListener('click', function(e) {
        const index = parseInt(this.dataset.index);
        openLightbox(index);
      });
    });

    // Клик по лупе
    const zoomIcon = document.querySelector('.zoom-icon');
    if (zoomIcon) {
      zoomIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const activeIndex = mainSwiper ? parseInt(mainSwiper.slides[mainSwiper.activeIndex].dataset.index) : 0;
        openLightbox(activeIndex);
      });
    }

    // Параллакс (только для картинок)
    const wrapper = document.querySelector('.main-swiper-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mousemove', function(e) {
        const activeSlide = mainSwiper?.slides[mainSwiper.activeIndex];
        if (!activeSlide || activeSlide.dataset.mediaType !== 'image') return;
        
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        const img = activeSlide.querySelector('img.parallax-img');
        if (img) img.style.transform = 'scale(1.05) translate(' + x + 'px, ' + y + 'px)';
      });

      wrapper.addEventListener('mouseleave', function() {
        const activeSlide = mainSwiper?.slides[mainSwiper.activeIndex];
        if (!activeSlide) return;
        const img = activeSlide.querySelector('img.parallax-img');
        if (img) img.style.transform = 'scale(1) translate(0, 0)';
      });
    }
  }

  // ==========================================
  // ЛАЙТБОКС
  // ==========================================
  function updateLightboxUI(index, total) {
    const counter = document.getElementById('lightboxCounter');
    const caption = document.getElementById('lightboxCaption');
    const progress = document.getElementById('lightboxProgress');
    
    const visibleData = getVisibleMediaData();
    const currentMedia = visibleData[index];

    if (counter) counter.textContent = (index + 1) + ' / ' + total;
    if (caption) caption.textContent = currentMedia ? currentMedia.alt : productTitle; // Заменили {{ product.title | json }}
    if (progress) progress.style.width = ((index + 1) / total * 100) + '%';
  }

  function initLightboxSwiper(initialIndex) {
    const visibleSlides = document.querySelectorAll('.weblegko-lightbox .swiper-slide:not(.thumbnail-list_item--variant)');
    const total = visibleSlides.length;
    if (total === 0) return;

    // Находим реальный индекс слайда в Swiper
    let realInitialIndex = 0;
    visibleSlides.forEach((slide, i) => {
      if (parseInt(slide.dataset.mediaId) === parseInt(document.querySelectorAll('.main-swiper .swiper-slide')[initialIndex]?.dataset.mediaId)) {
        realInitialIndex = i;
      }
    });

    if (lightboxSwiper) { lightboxSwiper.destroy(true, true); lightboxSwiper = null; }

    setTimeout(() => {
      lightboxSwiper = new Swiper('.lightbox-swiper', {
        slidesPerView: 1, spaceBetween: 0, initialSlide: realInitialIndex,
        centeredSlides: true, autoHeight: false, speed: 800,
        navigation: { nextEl: '.lb-btn-next', prevEl: '.lb-btn-prev' },
        on: {
          slideChange: function() {
            if (window.pauseAllMedia) window.pauseAllMedia(); // Пауза при смене
            
            const activeSlide = this.slides[this.activeIndex];
            const deferredMedia = activeSlide.querySelector('deferred-media');
            
            // Загрузка видео/3D только для активного слайда
            if (deferredMedia && !deferredMedia.classList.contains('active')) {
              deferredMedia.loadContent();
              deferredMedia.classList.add('active');
            }

            // Сброс зума
            this.slides.forEach(s => {
              const img = s.querySelector('img.lb-img');
              if (img) { img.classList.remove('zoomed'); img.style.transform = 'scale(1)'; }
            });
            isZoomed = false;

            updateLightboxUI(this.activeIndex, this.slides.length);
          },
          init: function() {
            const activeSlide = this.slides[this.activeIndex];
            const deferredMedia = activeSlide.querySelector('deferred-media');
            if (deferredMedia) {
              deferredMedia.loadContent();
              deferredMedia.classList.add('active');
            }
            updateLightboxUI(this.activeIndex, this.slides.length);
          }
        }
      });
    }, 50);
  }

  // ==========================================
  // ОТКРЫТИЕ / ЗАКРЫТИЕ
  // ==========================================
  window.openLightbox = function(index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    initLightboxSwiper(index);
  };

  window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    if (window.pauseAllMedia) window.pauseAllMedia();

    // Полная очистка памяти: удаляем iframe/video/model-viewer из лайтбокса при закрытии
    document.querySelectorAll('.weblegko-lightbox deferred-media').forEach(dm => {
      const iframe = dm.querySelector('iframe');
      const video = dm.querySelector('video');
      const modelViewer = dm.querySelector('model-viewer');
      if (iframe) iframe.remove();
      if (video) { video.pause(); video.remove(); }
      if (modelViewer) modelViewer.remove();
      dm.removeAttribute('loaded'); // Сбрасываем атрибут, чтобы при следующем открытии видео загрузилось заново
      dm.classList.remove('active');
    });

    if (lightboxSwiper) { lightboxSwiper.destroy(true, true); lightboxSwiper = null; }
  };

  // ==========================================
  // ЗУМ, КЛАВИШИ, ФОН
  // ==========================================
  document.addEventListener('click', function(e) {
    const img = e.target.closest('.lightbox-swiper .swiper-slide img.lb-img');
    if (!img) return;
    e.stopPropagation();
    if (img.classList.contains('zoomed')) {
      img.classList.remove('zoomed'); img.style.transform = 'scale(1)'; isZoomed = false;
    } else {
      img.classList.add('zoomed'); img.style.transform = 'scale(1.25)'; isZoomed = true;
    }
  });

  document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight' && lightboxSwiper) lightboxSwiper.slideNext();
    else if (e.key === 'ArrowLeft' && lightboxSwiper) lightboxSwiper.slidePrev();
  });

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
  }

  // ==========================================
  // ЗАПУСК
  // ==========================================
  initGallerySwiper();
});
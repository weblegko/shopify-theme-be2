function initPremiumSlider() {
  if (typeof Swiper !== 'undefined') {
    const sliderEl = document.querySelector('.premiumSwiper');
    if (sliderEl && !sliderEl.classList.contains('swiper-initialized')) {
      const slides = sliderEl.querySelectorAll('.swiper-slide');
      const realSlides = sliderEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
      const totalSlides = realSlides.length;

      if (totalSlides === 0) {
        const paginationEl = document.querySelector('.premium-pagination');
        if (paginationEl) paginationEl.style.display = 'none';
        return;
      }

      const bulletsCount = Math.min(totalSlides, 3);
      const paginationEl = document.querySelector('.premium-pagination');
      paginationEl.innerHTML = '';

      for (let i = 0; i < bulletsCount; i++) {
        const bullet = document.createElement('span');
        bullet.className = 'custom-bullet';
        bullet.dataset.index = i;

        const progress = document.createElement('span');
        progress.className = 'bullet-progress';
        progress.style.width = '0%';

        bullet.appendChild(progress);
        paginationEl.appendChild(bullet);
      }

      // Получаем настройки отступов из data-атрибутов
      const spaceBetweenMobile = parseInt(sliderEl.dataset.spaceMobile) || 10;
      const spaceBetweenTablet = parseInt(sliderEl.dataset.spaceTablet) || 20;
      const spaceBetweenDesktop = parseInt(sliderEl.dataset.spaceDesktop) || 20;

      const swiper = new Swiper('.premiumSwiper', {
        slidesPerView: 1,
        spaceBetween: spaceBetweenMobile,
        loop: totalSlides > 3 ? true : false,
        speed: 600,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: false,
        breakpoints: {
          0: {
            slidesPerView: 1.045,
            spaceBetween: spaceBetweenMobile,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: spaceBetweenTablet,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: spaceBetweenDesktop,
          },
        },
      });

      function updateBullets(swiperInstance) {
        let currentIndex = swiperInstance.realIndex;

        if (totalSlides > 3) {
          currentIndex = currentIndex % totalSlides;
        }

        const bullets = document.querySelectorAll('.premium-pagination .custom-bullet');
        if (bullets.length === 0) return;

        const bulletsCount = bullets.length;

        bullets.forEach((bullet, idx) => {
          let start = Math.round((idx / bulletsCount) * totalSlides);
          let end = Math.round(((idx + 1) / bulletsCount) * totalSlides);

          if (idx === bulletsCount - 1) {
            end = totalSlides;
          }

          const isActive = currentIndex >= start && currentIndex < end;
          bullet.classList.toggle('active', isActive);

          let progress = 0;
          if (isActive) {
            const positionInGroup = currentIndex - start;
            const groupSize = end - start;
            progress = (positionInGroup / groupSize) * 100;
          } else if (currentIndex >= end) {
            progress = 100;
          }

          const progressBar = bullet.querySelector('.bullet-progress');
          if (progressBar) {
            progressBar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
          }

          bullet.onclick = function() {
            const targetIndex = Math.round((idx / bulletsCount) * totalSlides);
            if (totalSlides > 3) {
              const slides = swiperInstance.slides;
              let targetSlideIndex = -1;
              for (let i = 0; i < slides.length; i++) {
                if (!slides[i].classList.contains('swiper-slide-duplicate')) {
                  const slideIndex = parseInt(slides[i].getAttribute('data-swiper-slide-index'));
                  if (slideIndex === targetIndex) {
                    targetSlideIndex = i;
                    break;
                  }
                }
              }
              if (targetSlideIndex !== -1) {
                swiperInstance.slideTo(targetSlideIndex);
              }
            } else {
              swiperInstance.slideTo(targetIndex);
            }
          };
        });
      }

      swiper.on('init', function() {
        setTimeout(() => updateBullets(this), 100);
      });

      swiper.on('slideChange', function() {
        updateBullets(this);
      });

      swiper.on('resize', function() {
        updateBullets(this);
      });

      sliderEl.swiper = swiper;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremiumSlider);
} else {
  initPremiumSlider();
}

document.addEventListener('shopify:section:load', function (e) {
  if (e.target.querySelector('.premiumSwiper')) {
    const oldSlider = e.target.querySelector('.premiumSwiper.swiper-initialized');
    if (oldSlider && oldSlider.swiper) {
      oldSlider.swiper.destroy(true, true);
    }
    const paginationEl = document.querySelector('.premium-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
    }
    initPremiumSlider();
  }
});
function initSecondarySlider() {
  if (typeof Swiper !== 'undefined') {
    const sliderEl = document.querySelector('.mySecondarySwiper');
    if (sliderEl && !sliderEl.classList.contains('swiper-initialized')) {
      // Получаем количество реальных слайдов
      const realSlides = sliderEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
      const totalSlides = realSlides.length;
      
      // Определяем количество булетов (максимум 3)
      const bulletsCount = Math.min(totalSlides, 3);
      
      // Получаем контейнер пагинации
      const paginationEl = document.querySelector('.secondary-slider-pagination');
      
      // Очищаем контейнер
      paginationEl.innerHTML = '';
      
      // Создаем кастомные булеты
      for (let i = 0; i < bulletsCount; i++) {
        const bullet = document.createElement('span');
        bullet.className = 'custom-bullet';
        bullet.dataset.index = i;
        
        // Создаем прогресс-бар
        const progress = document.createElement('span');
        progress.className = 'bullet-progress';
        progress.style.width = '0%';
        
        bullet.appendChild(progress);
        paginationEl.appendChild(bullet);
      }
      
      // Инициализируем Swiper с отключенной пагинацией
      const swiper = new Swiper('.mySecondarySwiper', {
        loop: true,
        speed: 600,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: false,
        navigation: {
          nextEl: '.secondary-button-next',
          prevEl: '.secondary-button-prev',
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: -2,
          }
        }
      });
      
      // Функция обновления булетов
      function updateBullets(swiperInstance) {
        let currentIndex = swiperInstance.realIndex % totalSlides;
        
        const bullets = document.querySelectorAll('.secondary-slider-pagination .custom-bullet');
        
        if (bullets.length === 0) return;
        
        const bulletsCount = bullets.length;
        
        bullets.forEach((bullet, idx) => {
          // Определяем диапазон слайдов для этого булета
          let start = Math.round((idx / bulletsCount) * totalSlides);
          let end = Math.round(((idx + 1) / bulletsCount) * totalSlides);
          
          // Для последнего булета включаем все оставшиеся
          if (idx === bulletsCount - 1) {
            end = totalSlides;
          }
          
          // Проверяем активность
          const isActive = currentIndex >= start && currentIndex < end;
          bullet.classList.toggle('active', isActive);
          
          // Вычисляем прогресс
          let progress = 0;
          if (isActive) {
            const positionInGroup = currentIndex - start;
            const groupSize = end - start;
            progress = (positionInGroup / groupSize) * 100;
          } else if (currentIndex >= end) {
            progress = 100;
          }
          
          // Обновляем прогресс-бар
          const progressBar = bullet.querySelector('.bullet-progress');
          if (progressBar) {
            progressBar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
          }
          
          // Обработчик клика
          bullet.onclick = function() {
            const targetIndex = Math.round((idx / bulletsCount) * totalSlides);
            // Находим слайд с нужным индексом в loop режиме
            const slides = swiperInstance.slides;
            for (let i = 0; i < slides.length; i++) {
              if (!slides[i].classList.contains('swiper-slide-duplicate')) {
                const slideIndex = parseInt(slides[i].getAttribute('data-swiper-slide-index'));
                if (slideIndex === targetIndex) {
                  swiperInstance.slideTo(i);
                  break;
                }
              }
            }
          };
        });
      }
      
      // Обновляем булеты при событиях
      swiper.on('init', function() {
        setTimeout(() => updateBullets(this), 100);
      });
      
      swiper.on('slideChange', function() {
        updateBullets(this);
      });
      
      swiper.on('resize', function() {
        updateBullets(this);
      });
      
      // Сохраняем ссылку
      sliderEl.swiper = swiper;
    }
  }
}

// Запуск (с защитой от двойной инициализации при Hot Reload)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSecondarySlider);
} else {
  initSecondarySlider();
}

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.mySecondarySwiper')) {
    const oldSlider = e.target.querySelector('.mySecondarySwiper.swiper-initialized');
    if (oldSlider && oldSlider.swiper) {
      oldSlider.swiper.destroy(true, true);
    }
    // Очищаем пагинацию
    const paginationEl = document.querySelector('.secondary-slider-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
    }
    initSecondarySlider();
  }
});
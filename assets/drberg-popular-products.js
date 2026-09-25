let popularSwiper = null;
const mobileMediaQuery = window.matchMedia('(max-width: 639px)');

function initPopularSlider() {
  if (typeof Swiper === 'undefined') return;
  const sliderEl = document.querySelector('.popularSwiper');
  if (!sliderEl || sliderEl.classList.contains('swiper-initialized')) return;

  const realSlides = sliderEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
  const totalSlides = realSlides.length;

  if (totalSlides === 0) {
    const paginationEl = document.querySelector('.popular-pagination');
    if (paginationEl) paginationEl.style.display = 'none';
    return;
  }

  const bulletsCount = Math.min(totalSlides, 3);
  const paginationEl = document.querySelector('.popular-pagination');
  paginationEl.innerHTML = '';
  paginationEl.style.display = 'flex';

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

  const spaceBetweenMobile = parseInt(sliderEl.dataset.spaceMobile) || 10;
  const isLoop = totalSlides > 6 ? true : false;

  // Ищем универсальные кнопки внутри текущего слайдера
  const nextBtn = sliderEl.querySelector('.slider-arrow--next');
  const prevBtn = sliderEl.querySelector('.slider-arrow--prev');

  // Передаем sliderEl напрямую вместо строки '.popularSwiper'
  popularSwiper = new Swiper(sliderEl, {
    slidesPerView: 1.045,
    spaceBetween: spaceBetweenMobile,
    loop: isLoop,
    speed: 600,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: false,
    // Добавляем навигацию
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
      disabledClass: 'slider-arrow--disabled', // Указываем наш универсальный класс
    },
    on: {
      slideChange: function() { updatePopularBullets(this); },
      resize: function() { updatePopularBullets(this); }
    }
  });

  updatePopularBullets(popularSwiper);
}

function destroyPopularSlider() {
  if (popularSwiper) {
    popularSwiper.destroy(true, true);
    popularSwiper = null;
    const paginationEl = document.querySelector('.popular-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
    }
    const sliderEl = document.querySelector('.popularSwiper');
    if (sliderEl) sliderEl.classList.remove('swiper-initialized');
  }
}

function handleMobileChange(e) {
  if (e.matches) {
    // Экран стал мобильным
    initPopularSlider();
  } else {
    // Экран стал планшетом/десктопом
    destroyPopularSlider();
  }
}

// Функция пагинации
function updatePopularBullets(swiperInstance) {
  const bullets = document.querySelectorAll('.popular-pagination .custom-bullet');
  if (bullets.length === 0 || !popularSwiper) return;

  let overallProgress = swiperInstance.progress;
  overallProgress = Math.min(Math.max(overallProgress, 0), 1);

  const totalSlidesEl = swiperInstance.el.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
  const totalSlides = totalSlidesEl.length;
  const isLoop = swiperInstance.params.loop;
  const bulletsCount = bullets.length;

  bullets.forEach((bullet, idx) => {
    const bulletStart = idx / bulletsCount;
    const bulletEnd = (idx + 1) / bulletsCount;

    let bulletProgress = 0;
    let isActive = false;

    if (overallProgress >= bulletEnd) {
      bulletProgress = 1;
      isActive = false;
    } else if (overallProgress >= bulletStart) {
      bulletProgress = (overallProgress - bulletStart) / (bulletEnd - bulletStart);
      isActive = true;
    } else {
      bulletProgress = 0;
      isActive = false;
    }

    if (overallProgress === 1 && idx === bulletsCount - 1) {
      bulletProgress = 1;
      isActive = true;
    }

    bullet.classList.toggle('active', isActive);
    const progressBar = bullet.querySelector('.bullet-progress');
    if (progressBar) {
      progressBar.style.width = (bulletProgress * 100) + '%';
    }

    bullet.onclick = function() {
      const currentSpv = Math.round(swiperInstance.params.slidesPerView) || 1;
      const maxIndex = isLoop ? (totalSlides - 1) : Math.max(0, totalSlides - currentSpv);
      const targetIndex = Math.round(bulletStart * maxIndex);
      
      if (isLoop) {
        swiperInstance.slideToLoop(targetIndex);
      } else {
        swiperInstance.slideTo(targetIndex);
      }
    };
  });
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mobileMediaQuery.addEventListener('change', handleMobileChange);
    handleMobileChange(mobileMediaQuery);
  });
} else {
  mobileMediaQuery.addEventListener('change', handleMobileChange);
  handleMobileChange(mobileMediaQuery);
}

// Поддержка Shopify Customizer
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.popularSwiper')) {
    handleMobileChange(mobileMediaQuery);
  }
});
// ==========================================
// 1. ЛОГИКА ДЕСКТОПА (SHOW MORE)
// ==========================================
function initResources() {
  const grid = document.getElementById('drberg-resources-grid');
  const btn = document.getElementById('drberg-resources-show-more-btn');
  const loader = document.getElementById('drberg-resources-loader');
  const btnText = document.getElementById('drberg-resources-btn-text');

  // Если мы на мобилке, десктопный скрипт не запускаем
  if (window.innerWidth < 640 || !grid || !btn) return;

  const items = grid.querySelectorAll('.drberg-resources__item');
  if (items.length === 0) {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = '';
  btn.disabled = false;
  if (loader) loader.classList.add('is-hidden');
  if (btnText) btnText.textContent = 'Show More Resources';

  items.forEach((item) => {
    item.classList.add('is-hidden');
    item.classList.remove('drberg-resources__item--animate');
  });

  grid.dataset.visible = 0;

  function getCSSVar(varName) {
    return parseInt(getComputedStyle(grid).getPropertyValue(varName)) || 1;
  }

  function showItems(count) {
    let currentVisible = parseInt(grid.dataset.visible) || 0;
    const totalToShow = Math.min(currentVisible + count, items.length);

    for (let i = currentVisible; i < totalToShow; i++) {
      items[i].classList.remove('is-hidden');
      items[i].classList.add('drberg-resources__item--animate');
    }

    grid.dataset.visible = totalToShow;
    if (totalToShow >= items.length) {
      btn.style.display = 'none';
    }
  }

  const initialItems = getCSSVar('--initial-items');
  showItems(initialItems);
}

if (!window.resourcesListenerAdded) {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('#drberg-resources-show-more-btn');
    if (btn && !btn.disabled) {
      const grid = document.getElementById('drberg-resources-grid');
      const loader = document.getElementById('drberg-resources-loader');
      const btnText = document.getElementById('drberg-resources-btn-text');

      if (!grid) return;

      btn.disabled = true;
      if (loader) loader.classList.remove('is-hidden');
      if (btnText) btnText.textContent = 'Loading...';

      setTimeout(function () {
        if (loader) loader.classList.add('is-hidden');
        if (btnText) btnText.textContent = 'Show More Resources';
        btn.disabled = false;

        const gridCols = parseInt(getComputedStyle(grid).getPropertyValue('--grid-cols')) || 1;
        let currentVisible = parseInt(grid.dataset.visible) || 0;
        const items = grid.querySelectorAll('.drberg-resources__item');
        const totalToShow = Math.min(currentVisible + gridCols, items.length);

        for (let i = currentVisible; i < totalToShow; i++) {
          items[i].classList.remove('is-hidden');
          items[i].classList.add('drberg-resources__item--animate');
        }

        grid.dataset.visible = totalToShow;
        if (totalToShow >= items.length) {
          btn.style.display = 'none';
        }
      }, 1000);
    }
  });
  window.resourcesListenerAdded = true;
}


// ==========================================
// 2. ЛОГИКА МОБИЛКИ (СЛАЙДЕР)
// ==========================================
let resourcesSwiper = null;
const resourcesMobileMediaQuery = window.matchMedia('(max-width: 639px)');

function initResourcesSlider() {
  if (typeof Swiper === 'undefined') return;
  const sliderEl = document.querySelector('.resourcesSwiper');
  if (!sliderEl || sliderEl.classList.contains('swiper-initialized')) return;

  const realSlides = sliderEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
  const totalSlides = realSlides.length;

  if (totalSlides === 0) {
    const paginationEl = document.querySelector('.resources-pagination');
    if (paginationEl) paginationEl.style.display = 'none';
    return;
  }

  // ДЕЛАЕМ РОВНО 2 БУЛЛЕТА (или меньше, если слайдов всего 1)
  const bulletsCount = Math.min(totalSlides, 2);
  const paginationEl = document.querySelector('.resources-pagination');
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

  const spaceBetweenMobile = parseInt(sliderEl.dataset.spaceMobile) || 15;
  const isLoop = totalSlides > 4 ? true : false; // Для 2-х буллетов loop нужен при > 4 слайдов

  resourcesSwiper = new Swiper('.resourcesSwiper', {
    slidesPerView: 1.045,
    spaceBetween: spaceBetweenMobile,
    loop: isLoop,
    speed: 600,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: false,
    on: {
      slideChange: function() { updateResourcesBullets(this); },
      resize: function() { updateResourcesBullets(this); }
    }
  });

  updateResourcesBullets(resourcesSwiper);
}

function destroyResourcesSlider() {
  if (resourcesSwiper) {
    resourcesSwiper.destroy(true, true);
    resourcesSwiper = null;
    const paginationEl = document.querySelector('.resources-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
    }
    const sliderEl = document.querySelector('.resourcesSwiper');
    if (sliderEl) sliderEl.classList.remove('swiper-initialized');
  }
}

function handleResourcesMobileChange(e) {
  if (e.matches) {
    initResourcesSlider();
  } else {
    destroyResourcesSlider();
    initResources(); // Перезапускаем десктопный скрипт при возврате на десктоп
  }
}

function updateResourcesBullets(swiperInstance) {
  const bullets = document.querySelectorAll('.resources-pagination .custom-bullet');
  if (bullets.length === 0 || !resourcesSwiper) return;

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
    resourcesMobileMediaQuery.addEventListener('change', handleResourcesMobileChange);
    handleResourcesMobileChange(resourcesMobileMediaQuery);
  });
} else {
  resourcesMobileMediaQuery.addEventListener('change', handleResourcesMobileChange);
  handleResourcesMobileChange(resourcesMobileMediaQuery);
}

// Поддержка Shopify Customizer
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.drberg-resources')) {
    handleResourcesMobileChange(resourcesMobileMediaQuery);
  }
});
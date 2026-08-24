function initPromoSlider() {
  if (typeof Swiper !== 'undefined') {
    const sliderEl = document.querySelector('.myPromoSwiper');
    // Проверяем, не инициализирован ли уже слайдер (защита от дублей при Hot Reload)
    if (sliderEl && !sliderEl.classList.contains('swiper-initialized')) {
      new Swiper('.myPromoSwiper', {
        loop: true,
        speed: 600,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.promo-button-next',
          prevEl: '.promo-button-prev',
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: -2,
          }
        }
      });
    }
  }
}

// Запуск
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPromoSlider);
} else {
  initPromoSlider();
}

// Перезапуск при смене секции в кастомайзере
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.myPromoSwiper')) {
    initPromoSlider();
  }
});
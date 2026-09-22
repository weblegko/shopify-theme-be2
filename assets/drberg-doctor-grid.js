function initDoctorSlider() {
  if (typeof Swiper !== "undefined") {
    const sliderEl = document.querySelector(".doctorSwiper");
    if (sliderEl && !sliderEl.classList.contains("swiper-initialized")) {
      // Считаем реальные слайды
      const realSlides = sliderEl.querySelectorAll(
        ".swiper-slide:not(.swiper-slide-duplicate)",
      );
      const totalSlides = realSlides.length;

      // Включаем loop только если слайдов больше 3
      const isLoop = totalSlides > 3 ? true : false;

      const swiper = new Swiper(".doctorSwiper", {
        loop: isLoop,
        speed: 600,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: ".doctor-button-next",
          prevEl: ".doctor-button-prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: -1,
          },
        },
      });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDoctorSlider);
} else {
  initDoctorSlider();
}

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".doctorSwiper")) {
    initDoctorSlider();
  }
});

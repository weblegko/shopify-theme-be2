function initPremiumSlider() {
  if (typeof Swiper !== "undefined") {
    const sliderEl = document.querySelector(".premiumSwiper");
    if (sliderEl && !sliderEl.classList.contains("swiper-initialized")) {
      const slides = sliderEl.querySelectorAll(".swiper-slide");
      const realSlides = sliderEl.querySelectorAll(
        ".swiper-slide:not(.swiper-slide-duplicate)",
      );
      const totalSlides = realSlides.length;

      if (totalSlides === 0) {
        const paginationEl = document.querySelector(".premium-pagination");
        if (paginationEl) paginationEl.style.display = "none";
        return;
      }

      const bulletsCount = Math.min(totalSlides, 3);
      const paginationEl = document.querySelector(".premium-pagination");
      paginationEl.innerHTML = "";

      for (let i = 0; i < bulletsCount; i++) {
        const bullet = document.createElement("span");
        bullet.className = "custom-bullet";
        bullet.dataset.index = i;

        const progress = document.createElement("span");
        progress.className = "bullet-progress";
        progress.style.width = "0%";

        bullet.appendChild(progress);
        paginationEl.appendChild(bullet);
      }

      const spaceBetweenMobile = parseInt(sliderEl.dataset.spaceMobile) || 10;
      const spaceBetweenTablet = parseInt(sliderEl.dataset.spaceTablet) || 20;
      const spaceBetweenDesktop = parseInt(sliderEl.dataset.spaceDesktop) || 20;

      const isLoop = totalSlides > 6 ? true : false;

      // Ищем кнопки в общем родителе (.drberg-premium__nav-wrapper)
      const navWrapper = sliderEl.closest('.drberg-premium__nav-wrapper');
      let nextBtn = null;
      let prevBtn = null;
      
      if (navWrapper) {
        nextBtn = navWrapper.querySelector(".slider-arrow--next");
        prevBtn = navWrapper.querySelector(".slider-arrow--prev");
      }

      const swiper = new Swiper(sliderEl, {
        slidesPerView: 1,
        spaceBetween: spaceBetweenMobile,
        loop: isLoop,
        speed: 600,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: false,
        navigation: {
          nextEl: nextBtn,
          prevEl: prevBtn,
          disabledClass: "slider-arrow--disabled",
        },
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
        const bullets = document.querySelectorAll(
          ".premium-pagination .custom-bullet",
        );
        if (bullets.length === 0 || totalSlides === 0) return;

        let overallProgress = swiperInstance.progress;
        overallProgress = Math.min(Math.max(overallProgress, 0), 1);

        bullets.forEach((bullet, idx) => {
          const bulletStart = idx / bulletsCount;
          const bulletEnd = (idx + 1) / bulletsCount;

          let bulletProgress = 0;
          let isActive = false;

          if (overallProgress >= bulletEnd) {
            bulletProgress = 1;
            isActive = false;
          } else if (overallProgress >= bulletStart) {
            bulletProgress =
              (overallProgress - bulletStart) / (bulletEnd - bulletStart);
            isActive = true;
          } else {
            bulletProgress = 0;
            isActive = false;
          }

          if (overallProgress === 1 && idx === bulletsCount - 1) {
            bulletProgress = 1;
            isActive = true;
          }

          bullet.classList.toggle("active", isActive);

          const progressBar = bullet.querySelector(".bullet-progress");
          if (progressBar) {
            progressBar.style.width = bulletProgress * 100 + "%";
          }

          bullet.onclick = function () {
            const currentSpv =
              Math.round(swiperInstance.params.slidesPerView) || 1;
            const maxIndex = isLoop
              ? totalSlides - 1
              : Math.max(0, totalSlides - currentSpv);
            const targetIndex = Math.round(bulletStart * maxIndex);

            if (isLoop) {
              swiperInstance.slideToLoop(targetIndex);
            } else {
              swiperInstance.slideTo(targetIndex);
            }
          };
        });
      }

      updateBullets(swiper);

      swiper.on("slideChange", function () {
        updateBullets(this);
      });

      swiper.on("resize", function () {
        updateBullets(this);
      });

      sliderEl.swiper = swiper;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPremiumSlider);
} else {
  initPremiumSlider();
}

document.addEventListener("shopify:section:load", function (e) {
  if (e.target.querySelector(".premiumSwiper")) {
    const oldSlider = e.target.querySelector(
      ".premiumSwiper.swiper-initialized",
    );
    if (oldSlider && oldSlider.swiper) {
      oldSlider.swiper.destroy(true, true);
    }
    const paginationEl = document.querySelector(".premium-pagination");
    if (paginationEl) {
      paginationEl.innerHTML = "";
    }
    initPremiumSlider();
  }
});
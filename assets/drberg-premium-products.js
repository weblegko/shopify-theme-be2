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

      // Определяем количество булетов (максимум 3)
      const bulletsCount = Math.min(totalSlides, 3);
      const paginationEl = document.querySelector(".premium-pagination");

      // Очищаем контейнер
      paginationEl.innerHTML = "";

      // Создаем кастомные булеты
      for (let i = 0; i < bulletsCount; i++) {
        const bullet = document.createElement("span");
        bullet.className = "custom-bullet";
        bullet.dataset.index = i;

        // Создаем прогресс-бар
        const progress = document.createElement("span");
        progress.className = "bullet-progress";
        progress.style.width = "0%";

        bullet.appendChild(progress);
        paginationEl.appendChild(bullet);
      }

      // Получаем настройки отступов из data-атрибутов
      const spaceBetweenMobile = parseInt(sliderEl.dataset.spaceMobile) || 10;
      const spaceBetweenTablet = parseInt(sliderEl.dataset.spaceTablet) || 20;
      const spaceBetweenDesktop = parseInt(sliderEl.dataset.spaceDesktop) || 20;

      // Инициализируем Swiper.
      // Включаем loop только если слайдов больше 6 (иначе warning на десктопе при slidesPerView: 3)
      const isLoop = totalSlides > 6 ? true : false;

      const swiper = new Swiper(".premiumSwiper", {
        slidesPerView: 1,
        spaceBetween: spaceBetweenMobile,
        loop: isLoop,
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

      // Функция обновления булетов (чистая математика и нативный API Swiper)
      function updateBullets(swiperInstance) {
        const bullets = document.querySelectorAll(
          ".premium-pagination .custom-bullet",
        );
        if (bullets.length === 0 || totalSlides === 0) return;

        // 1. Берем нативный прогресс Swiper (от 0.0 до 1.0)
        // Он сам учитывает slidesPerView и loop. Если мы в начале — он равен 0. Если в самом конце — 1.
        let overallProgress = swiperInstance.progress;

        // Защита от микро-погрешностей CSS трансформаций (иногда Swiper выдает 1.0001 или -0.0001)
        overallProgress = Math.min(Math.max(overallProgress, 0), 1);

        bullets.forEach((bullet, idx) => {
          // 2. Границы каждого булета в долях от 0 до 1
          // Для 3 буллетов это: 1-й (0 - 0.333), 2-й (0.333 - 0.666), 3-й (0.666 - 1.0)
          const bulletStart = idx / bulletsCount;
          const bulletEnd = (idx + 1) / bulletsCount;

          let bulletProgress = 0;
          let isActive = false;

          if (overallProgress >= bulletEnd) {
            // Мы уже прошли этот булет — он заполнен на 100%
            bulletProgress = 1;
            isActive = false;
          } else if (overallProgress >= bulletStart) {
            // Мы внутри этого булета — считаем точный процент заполнения
            bulletProgress =
              (overallProgress - bulletStart) / (bulletEnd - bulletStart);
            isActive = true;
          } else {
            // Мы еще не дошли до этого булета — он пустой (0%)
            bulletProgress = 0;
            isActive = false;
          }

          // Дополнительная защита: если мы в самом конце, жестко ставим 100% на последнем булете
          if (overallProgress === 1 && idx === bulletsCount - 1) {
            bulletProgress = 1;
            isActive = true;
          }

          bullet.classList.toggle("active", isActive);

          // Обновляем прогресс-бар
          const progressBar = bullet.querySelector(".bullet-progress");
          if (progressBar) {
            progressBar.style.width = bulletProgress * 100 + "%";
          }

          // 3. Математически точный клик
          bullet.onclick = function () {
            // Узнаем, сколько слайдов сейчас реально показывается на экране
            const currentSpv =
              Math.round(swiperInstance.params.slidesPerView) || 1;

            // Вычисляем максимальный индекс, до которого можно доскроллить.
            // Если слайдер зациклен (loop), он может доехать до последнего слайда (totalSlides - 1).
            // Если не зациклен, он упрется в (totalSlides - currentSpv).
            const maxIndex = isLoop
              ? totalSlides - 1
              : Math.max(0, totalSlides - currentSpv);

            // Целевой индекс для клика
            const targetIndex = Math.round(bulletStart * maxIndex);

            if (isLoop) {
              swiperInstance.slideToLoop(targetIndex);
            } else {
              swiperInstance.slideTo(targetIndex);
            }
          };
        });
      }

      // Обновляем булеты сразу при инициализации и при смене слайда
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

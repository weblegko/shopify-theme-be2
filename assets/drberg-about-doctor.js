function initAboutText() {
  const container = document.getElementById('about-text-container');
  const btn = document.getElementById('about-show-more-btn');
  const loader = document.getElementById('about-loader');
  const btnText = document.getElementById('about-btn-text');

  if (!container) return;

  // Получаем текст кнопки из глобального объекта
  const buttonLabel = (window.drbergAboutConfig && window.drbergAboutConfig.buttonLabel) || 'Show More';

  const paragraphs = container.querySelectorAll('.about-paragraph');
  if (paragraphs.length === 0) {
    if (btn) btn.style.display = 'none';
    return;
  }

  // Получаем текущий брейкпоинт
  function getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Получаем количество абзацев для текущего брейкпоинта
  function getInitialCount() {
    const breakpoint = getCurrentBreakpoint();
    if (breakpoint === 'mobile') {
      return parseInt(container.dataset.mobileInitial) || 1;
    } else if (breakpoint === 'tablet') {
      return parseInt(container.dataset.tabletInitial) || 2;
    } else {
      return parseInt(container.dataset.desktopInitial) || 2;
    }
  }

  // Функция показа абзацев
  function showParagraphs(count) {
    let currentVisible = parseInt(container.dataset.visible) || 0;
    const totalToShow = Math.min(currentVisible + count, paragraphs.length);

    for (let i = currentVisible; i < totalToShow; i++) {
      paragraphs[i].classList.remove('about-paragraph-hidden');
      paragraphs[i].classList.add('about-paragraph-animate');
    }

    container.dataset.visible = totalToShow;

    if (totalToShow >= paragraphs.length && btn) {
      btn.style.display = 'none';
    }
  }

  // Сброс
  if (btn) {
    btn.style.display = '';
    btn.disabled = false;
    if (loader) loader.classList.add('tw:hidden');
    if (btnText) btnText.textContent = buttonLabel;
  }

  paragraphs.forEach((item) => {
    item.classList.add('about-paragraph-hidden');
    item.classList.remove('about-paragraph-animate');
  });

  container.dataset.visible = 0;

  // Показываем начальное количество
  const initialCount = getInitialCount();
  showParagraphs(initialCount);

  // Обработчик клика
  if (btn) {
    btn.onclick = function() {
      if (btn.disabled) return;

      btn.disabled = true;
      if (loader) loader.classList.remove('tw:hidden');
      if (btnText) btnText.textContent = 'Loading...';

      setTimeout(function() {
        if (loader) loader.classList.add('tw:hidden');
        if (btnText) btnText.textContent = buttonLabel;
        btn.disabled = false;

        // Показываем все оставшиеся абзацы
        const remaining = paragraphs.length - parseInt(container.dataset.visible);
        showParagraphs(remaining);
      }, 500);
    };
  }

  // Обновляем при ресайзе (если изменился брейкпоинт)
  let lastBreakpoint = getCurrentBreakpoint();
  window.addEventListener('resize', function() {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== lastBreakpoint) {
      lastBreakpoint = newBreakpoint;
      
      // Сбрасываем видимость
      paragraphs.forEach((item) => {
        item.classList.add('about-paragraph-hidden');
        item.classList.remove('about-paragraph-animate');
      });
      container.dataset.visible = 0;
      if (btn) btn.style.display = '';

      // Показываем новое количество
      const newCount = getInitialCount();
      showParagraphs(newCount);
    }
  });
}

// ЗАПУСК
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutText);
} else {
  initAboutText();
}

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('#about-text-container')) {
    initAboutText();
  }
});
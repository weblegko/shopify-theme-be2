function initResources() {
  const grid = document.getElementById('drberg-resources-grid');
  const btn = document.getElementById('drberg-resources-show-more-btn');
  const loader = document.getElementById('drberg-resources-loader');
  const btnText = document.getElementById('drberg-resources-btn-text');

  if (!grid || !btn) return;

  const items = grid.querySelectorAll('.drberg-resources__item');
  if (items.length === 0) {
    btn.style.display = 'none';
    return;
  }

  // Сброс при Hot Reload
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

// Глобальный слушатель (Event Delegation)
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

// ЗАПУСК
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResources);
} else {
  initResources();
}

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('#drberg-resources-grid')) {
    initResources();
  }
});
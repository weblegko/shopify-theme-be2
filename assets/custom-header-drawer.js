(function() {
    const drawer = document.getElementById('CustomDrawer');
    const overlay = document.getElementById('CustomDrawerOverlay');
    const panel = document.getElementById('CustomDrawerPanel');
    const closeBtn = document.getElementById('CustomDrawerClose');
    const triggers = document.querySelectorAll('[data-custom-drawer-trigger]');
 
    if (!drawer || triggers.length === 0) return;
     
    // Переносим драйвер в корень <body>
    document.body.appendChild(drawer);
 
    function openDrawer() {
      drawer.classList.remove('is-hidden');
       
      requestAnimationFrame(() => {
        overlay.classList.add('is-visible');
        panel.classList.add('is-open');
      });
       
      // Используем глобальную функцию
      window.lockBodyScroll();
    }
 
    function closeDrawer() {
      overlay.classList.remove('is-visible');
      panel.classList.remove('is-open');
       
      // Используем глобальную функцию
      window.unlockBodyScroll();
       
      setTimeout(() => {
        drawer.classList.add('is-hidden');
      }, 300);
    }
 
    triggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        openDrawer();
      });
    });
 
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
 
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !drawer.classList.contains('is-hidden')) {
        closeDrawer();
      }
    });
  })();
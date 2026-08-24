document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.drberg-tab-btn');
  const contents = document.querySelectorAll('.drberg-tab-content');

  if (tabs.length === 0) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      contents.forEach(function (c) {
        c.classList.remove('active');
      });

      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      var targetId = this.getAttribute('data-tab');
      var target = document.getElementById(targetId);
      if (target) {
        target.classList.add('active');
      }
    });
  });
});
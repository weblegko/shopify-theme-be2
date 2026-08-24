function shrinkFaq(el, summary) {
  el.animating = true;
  const startHeight = el.offsetHeight + 'px';
  const endHeight = summary.offsetHeight + 'px';
  el.style.overflow = 'hidden';
  const animation = el.animate([{ height: startHeight }, { height: endHeight }], {
    duration: 300, easing: 'ease-out',
  });
  animation.onfinish = () => { el.open = false; el.style.overflow = ''; el.animating = false; };
  animation.oncancel = () => { el.style.overflow = ''; el.animating = false; };
}

function openFaq(el, summary, content) {
  el.animating = true;
  el.style.height = el.offsetHeight + 'px';
  el.open = true;
  const startHeight = el.offsetHeight + 'px';
  const endHeight = summary.offsetHeight + content.offsetHeight + 'px';
  el.style.overflow = 'hidden';
  const animation = el.animate([{ height: startHeight }, { height: endHeight }], {
    duration: 300, easing: 'ease-out',
  });
  animation.onfinish = () => { el.style.overflow = ''; el.style.height = ''; el.animating = false; };
  animation.oncancel = () => { el.style.overflow = ''; el.style.height = ''; el.animating = false; };
}

if (!window.faqListenerAdded) {
  document.addEventListener('click', function (e) {
    const summary = e.target.closest('details.faq-animate > summary');
    if (!summary) return;
    e.preventDefault(); 
    const el = summary.parentElement;
    const content = el.querySelector('.faq-content');
    if (el.animating) return;
    if (el.open) { shrinkFaq(el, summary); } else { openFaq(el, summary, content); }
  });
  window.faqListenerAdded = true;
}
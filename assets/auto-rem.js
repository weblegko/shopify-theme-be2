// auto-rem.js
export function getScaleFactor(baseSiteWidth = 1440) {
  if (window.innerWidth >= baseSiteWidth) {
    return window.innerWidth / baseSiteWidth;
  }
  return 1;
}

export function initAutoRem({ baseSiteWidth = 1440, baseFontSize = 10 } = {}) {
  const htmlElement = document.documentElement;

  function updateFontSize() {
    const viewportWidth = window.innerWidth;
    const screenWidth = viewportWidth;

    const scaleFactor = screenWidth / baseSiteWidth;

    if (screenWidth >= baseSiteWidth) {
      const newFontSize = baseFontSize * scaleFactor;
      htmlElement.style.fontSize = `${newFontSize}px`;
    //   console.log("forced rem mode:", { screenWidth, baseSiteWidth, scaleFactor });    
    } else {
      htmlElement.style.fontSize = "10px";
    //   console.log("adaptive rem mode:", { screenWidth });
    }
  }

  window.addEventListener("resize", updateFontSize);
  updateFontSize();

  return () => window.removeEventListener("resize", updateFontSize);
}
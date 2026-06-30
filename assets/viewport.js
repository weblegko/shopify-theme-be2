export function initViewport({ breakpoint = 1440, designWidth = 1440 } = {}) {
  const applyViewport = () => {
    const screenWidth = window.screen.width;
    const dpr = window.devicePixelRatio || 1;
    const realWidth = screenWidth / dpr;

    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    // Adaptive mode
    if (realWidth < breakpoint) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
      console.log("adaptive mode:", { realWidth, breakpoint });
      return;
    }

    // Forced mode
    const scale = realWidth / designWidth;
    meta.setAttribute(
      "content",
      `width=${designWidth}, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=no`
    );
    console.log("forced mode:", { realWidth, designWidth, scale });
  };

  // Если DOM уже загружен, применяем сразу
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", applyViewport);
    // Возвращаем функцию очистки
    return () => {
      window.removeEventListener("DOMContentLoaded", applyViewport);
    };
  } else {
    // DOM уже готов (или уже загружен)
    applyViewport();
    // Ничего не нужно удалять, возвращаем пустую функцию
    return () => {};
  }
}
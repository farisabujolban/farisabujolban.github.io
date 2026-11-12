(() => {
  const canvas = document.querySelector(".letter-glitch");
  const context = canvas.getContext("2d");
  if (!context) return;

  const root = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-=<>/{}";
  const cellWidth = 24;
  const cellHeight = 26;
  const interval = 80;
  const baseOpacity = 0.17;
  const activeCells = new Map();
  let glyphs = [];
  let columns = 0;
  let timer;
  let pointer;

  const randomIndex = length => Math.floor(Math.random() * length);
  const randomGlyph = () => characters[randomIndex(characters.length)];

  function drawCell(index, opacity) {
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    context.clearRect(x, y, cellWidth, cellHeight);
    context.globalAlpha = opacity;
    context.fillText(glyphs[index], x + cellWidth / 2, y + cellHeight / 2);
  }

  function drawGrid() {
    context.fillStyle = getComputedStyle(root).getPropertyValue("--glitch-blue").trim();
    glyphs.forEach((_, index) => drawCell(index, baseOpacity));
    activeCells.clear();
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.font = "12px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    columns = Math.ceil(width / cellWidth);
    const rows = Math.ceil(height / cellHeight);
    glyphs = Array.from({ length: columns * rows }, () => Math.random() < 0.84 ? randomGlyph() : "");
    drawGrid();
  }

  function glitch(index) {
    glyphs[index] = randomGlyph();
    activeCells.set(index, 1);
  }

  function animate() {
    const changes = Math.ceil(glyphs.length / 240);
    for (let i = 0; i < changes; i++) glitch(randomIndex(glyphs.length));

    if (pointer) {
      const column = Math.floor(pointer.x / cellWidth);
      const row = Math.floor(pointer.y / cellHeight);
      for (let i = 0; i < 4; i++) {
        const nearbyColumn = column + randomIndex(9) - 4;
        const index = (row + randomIndex(7) - 3) * columns + nearbyColumn;
        if (nearbyColumn >= 0 && nearbyColumn < columns && index >= 0 && index < glyphs.length) glitch(index);
      }
      pointer = undefined;
    }

    for (const [index, intensity] of activeCells) {
      drawCell(index, baseOpacity + intensity * 0.36);
      if (intensity === 0) activeCells.delete(index);
      else activeCells.set(index, Math.max(0, intensity - 0.16));
    }
  }

  function updateMotion() {
    clearInterval(timer);
    timer = undefined;
    pointer = undefined;
    drawGrid();
    if (!reducedMotion.matches && !document.hidden) timer = setInterval(animate, interval);
  }

  window.addEventListener("pointermove", event => {
    if (timer !== undefined && event.pointerType === "mouse") pointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });

  window.addEventListener("pointerdown", event => {
    if (timer === undefined || !event.isPrimary || event.button !== 0) return;
    const row = Math.floor(event.clientY / cellHeight);
    const column = Math.floor(event.clientX / cellWidth);
    for (let x = Math.max(0, column - 9); x < Math.min(columns, column + 10); x++) {
      const index = row * columns + x;
      if (index < glyphs.length) glitch(index);
    }
  }, { passive: true });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", updateMotion);
  reducedMotion.addEventListener("change", updateMotion);
  new MutationObserver(drawGrid).observe(root, { attributeFilter: ["data-theme"] });
  resize();
  updateMotion();
})();

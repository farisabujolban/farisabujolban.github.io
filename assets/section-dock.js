(() => {
  const links = [...document.querySelectorAll(".section-dock a")];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  let currentLink;
  let frame;

  function updateDock() {
    frame = undefined;
    const viewport = document.scrollingElement;
    const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;
    let activeIndex = 0;
    let targetIndex = -1;

    for (const [index, section] of sections.entries()) {
      const top = section.getBoundingClientRect().top;
      const anchorOffset = parseFloat(getComputedStyle(section).scrollMarginTop);
      if (top <= anchorOffset + 1) activeIndex = index;
      if (links[index].hash === location.hash && top >= anchorOffset - 1) targetIndex = index;
    }

    // Near the end of the page, different links can land at the same scroll position.
    if (atBottom) activeIndex = targetIndex === -1 ? sections.length - 1 : targetIndex;
    const activeLink = links[activeIndex];
    if (currentLink === activeLink) return;

    currentLink?.removeAttribute("aria-current");
    activeLink.setAttribute("aria-current", "location");
    currentLink = activeLink;
  }

  function scheduleUpdate() {
    frame ??= requestAnimationFrame(updateDock);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  updateDock();
})();

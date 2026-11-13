(() => {
  const dialog = document.querySelector(".project-dialog");
  if (typeof dialog.showModal !== "function") return;

  const dialogKind = dialog.querySelector(".project-kind");
  const dialogTitle = dialog.querySelector("#project-dialog-title");
  const dialogContent = dialog.querySelector(".project-dialog-content");
  const closeButton = dialog.querySelector(".project-close");
  const projectGrid = document.querySelector("#projects .grid");

  for (const project of document.querySelectorAll(".project")) {
    const card = project.querySelector(".project-attachment");
    const content = card.querySelector('[data-slot="attachment-content"]');
    const heading = content.querySelector('[data-slot="attachment-title"]');
    const title = heading.textContent;
    const kind = content.querySelector(".project-kind").textContent;
    const summary = content.querySelector(".project-description");
    const tags = content.querySelector(".tags");
    const preview = card.querySelector('[data-slot="attachment-media"] img');
    const details = project.querySelector(".project-details");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-open";
    button.setAttribute("aria-label", `Open ${title} project details`);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", dialog.id);

    button.textContent = title;
    heading.replaceChildren(button);
    card.classList.add("is-expandable");

    card.addEventListener("click", (event) => {
      const control = event.target.closest("a, button");
      if (control && control !== button) return;
      if (!control && !window.getSelection().isCollapsed) return;

      dialogTitle.textContent = title;
      dialogKind.textContent = kind;
      dialogContent.replaceChildren();
      if (preview) dialogContent.append(preview.cloneNode(true));
      dialogContent.append(summary.cloneNode(true), details.content.cloneNode(true), tags.cloneNode(true));

      button.focus({ preventScroll: true });
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  }

  let projectUnderCloseButton = null;
  const restoreHover = (event) => {
    if (projectUnderCloseButton && event.target.closest?.(".project") === projectUnderCloseButton) return;

    projectGrid.classList.remove("suppress-hover");
    window.removeEventListener("pointermove", restoreHover);
  };
  closeButton.addEventListener("click", (event) => {
    const closedWithPointer = event.detail > 0;
    if (closedWithPointer) projectGrid.classList.add("suppress-hover");
    dialog.close();

    if (closedWithPointer) {
      projectUnderCloseButton = document.elementFromPoint(event.clientX, event.clientY)?.closest(".project");
      window.addEventListener("pointermove", restoreHover);
    }
  });

  let startedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    startedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (startedOnBackdrop && event.target === dialog) dialog.close();
    startedOnBackdrop = false;
  });
})();

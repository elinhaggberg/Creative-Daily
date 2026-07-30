import { openSheet } from "./sheet.js";
import { shareFilesOrDownload } from "./share.js";
import { ICON_CHECK } from "./icons.js";

// Renders every candidate card up front (like Substack's share picker) and
// lets you pick which ones you actually want, rather than silently bundling
// every piece from the day into one share action. `cards` is
// [{ id, dataUrl, files }] -- files is what gets shared/downloaded for that
// card if it ends up selected (the PNG, plus a voice recording file when
// that piece is a voice memo).
export function openImagePickerSheet(cards) {
  const sheet = openSheet("tpl-image-picker");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  const selected = new Set(cards.map((c) => c.id));

  const grid = el.querySelector("#image-picker-grid");
  const saveBtn = el.querySelector("#image-picker-save-btn");
  const selectAllBtn = el.querySelector("#image-picker-select-all-btn");

  function renderGrid() {
    grid.replaceChildren(
      ...cards.map((card) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "image-picker-item" + (selected.has(card.id) ? " selected" : "");
        btn.innerHTML = `<img src="${card.dataUrl}" alt="" /><span class="image-picker-check">${ICON_CHECK}</span>`;
        btn.addEventListener("click", () => {
          if (selected.has(card.id)) selected.delete(card.id);
          else selected.add(card.id);
          renderGrid();
        });
        return btn;
      })
    );
    saveBtn.textContent = selected.size > 0 ? `Save ${selected.size} selected` : "Save selected";
    saveBtn.disabled = selected.size === 0;
    selectAllBtn.textContent = selected.size === cards.length ? "Deselect all" : "Select all";
  }

  selectAllBtn.addEventListener("click", () => {
    if (selected.size === cards.length) cards.forEach((c) => selected.delete(c.id));
    else cards.forEach((c) => selected.add(c.id));
    renderGrid();
  });

  saveBtn.addEventListener("click", async () => {
    const files = cards.filter((c) => selected.has(c.id)).flatMap((c) => c.files);
    if (files.length === 0) return;
    await shareFilesOrDownload(files);
    sheet.close();
  });

  renderGrid();
}

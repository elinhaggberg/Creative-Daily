import {
  exportBackupData,
  exportRangeData,
  importData,
  markBackedUp,
  estimateImageBytes,
  clearImagesInRange,
  getDaysWithEntries,
  getDayNumber,
  todayKey,
} from "./storage.js";
import { openSheet } from "./sheet.js";
import { shareOrDownload, filenameFor } from "./share.js";
import { exportDayAsImage } from "./canvasExport.js";
import { promptSummaryFor } from "./dayDetail.js";
import { formatDate } from "./util.js";
import { typeFor } from "./entryTypes.js";

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAudioDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Builds a hidden, print-only DOM tree covering every day in [fromKey,
// toKey] and triggers the browser's native print dialog -- "Save as PDF" in
// that dialog is what produces the actual booklet. No PDF library needed,
// and it works the same on iOS Share Sheet / Android / desktop print-to-PDF.
async function printBooklet(fromKey, toKey) {
  const days = (await getDaysWithEntries()).filter((d) => d.dateKey >= fromKey && d.dateKey <= toKey).reverse();

  const root = document.createElement("div");
  root.className = "print-booklet";

  const cover = document.createElement("section");
  cover.className = "print-page print-cover";
  cover.innerHTML = `<h1>Creative Daily</h1><p>${formatDate(fromKey)} – ${formatDate(toKey)}</p>`;
  root.appendChild(cover);

  for (const day of days) {
    const { category, headline, prompt } = promptSummaryFor(day.dateKey);
    const dayNumber = await getDayNumber(day.dateKey);

    const page = document.createElement("section");
    page.className = "print-page";
    page.innerHTML = `
      <p class="print-daynum">Day ${dayNumber} · ${formatDate(day.dateKey)}</p>
      <p class="print-category">${category.label}</p>
      <h2>${headline}</h2>
      ${prompt.body && prompt.title ? `<p class="print-prompt-body">${prompt.body}</p>` : ""}
      ${prompt.meta ? `<p class="print-prompt-meta">${prompt.meta}</p>` : ""}
    `;

    const entriesWrap = document.createElement("div");
    entriesWrap.className = "print-entries";
    for (const entry of day.entries) {
      const entryEl = document.createElement("div");
      entryEl.className = "print-entry";
      const typeLabel = document.createElement("p");
      typeLabel.className = "print-entry-type";
      typeLabel.textContent =
        entry.type === "voice" && entry.audio
          ? `${typeFor(entry.type).label} · ${formatAudioDuration(entry.audioDuration)}`
          : typeFor(entry.type).label;
      entryEl.appendChild(typeLabel);
      for (const src of entry.images || []) {
        const img = document.createElement("img");
        img.src = src;
        entryEl.appendChild(img);
      }
      if (entry.type === "voice" && entry.audio) {
        const note = document.createElement("p");
        note.className = "print-entry-text print-entry-audio-note";
        note.textContent = "🎙 Audio recording — not included in print, only the caption below.";
        entryEl.appendChild(note);
      }
      if (entry.text) {
        const p = document.createElement("p");
        p.className = "print-entry-text";
        p.textContent = entry.text;
        entryEl.appendChild(p);
      }
      if (entry.url) {
        const p = document.createElement("p");
        p.className = "print-entry-text";
        p.textContent = entry.url;
        entryEl.appendChild(p);
      }
      entriesWrap.appendChild(entryEl);
    }
    page.appendChild(entriesWrap);
    root.appendChild(page);
  }

  document.body.appendChild(root);
  const cleanup = () => root.remove();
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  // Safety net for browsers that never fire afterprint (some mobile
  // webviews) -- the print dialog has certainly closed by then either way.
  setTimeout(cleanup, 60000);
}

export function openDayShareSheet(dateKey) {
  const sheet = openSheet("tpl-day-share");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  el.querySelector("#day-share-image-btn").addEventListener("click", async () => {
    await exportDayAsImage(dateKey);
    sheet.close();
  });
  el.querySelector("#day-share-pdf-btn").addEventListener("click", async () => {
    sheet.close();
    await printBooklet(dateKey, dateKey);
  });
  el.querySelector("#day-share-json-btn").addEventListener("click", async () => {
    const data = await exportRangeData(dateKey, dateKey);
    await shareOrDownload(filenameFor(`creative-daily-${dateKey}`), JSON.stringify(data, null, 2));
    sheet.close();
  });
}

export function openDataManagementSheet() {
  const sheet = openSheet("tpl-data-management");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  let justExportedFull = false;

  async function doFullExport() {
    const data = await exportBackupData();
    await shareOrDownload(filenameFor("creative-daily-backup"), JSON.stringify(data, null, 2));
    markBackedUp();
    justExportedFull = true;
    updateClearGate();
  }

  el.querySelector("#data-export-all-btn").addEventListener("click", doFullExport);

  const fromInput = el.querySelector("#data-range-from");
  const toInput = el.querySelector("#data-range-to");
  const today = todayKey();
  toInput.value = today;
  fromInput.value = today;

  el.querySelector("#data-range-pdf-btn").addEventListener("click", async () => {
    if (!fromInput.value || !toInput.value) return;
    sheet.close();
    await printBooklet(fromInput.value, toInput.value);
  });
  el.querySelector("#data-range-json-btn").addEventListener("click", async () => {
    if (!fromInput.value || !toInput.value) return;
    const data = await exportRangeData(fromInput.value, toInput.value);
    await shareOrDownload(filenameFor(`creative-daily-collection-${fromInput.value}-to-${toInput.value}`), JSON.stringify(data, null, 2));
  });

  const storageEl = el.querySelector("#data-storage-estimate");
  const clearGateMsg = el.querySelector("#data-clear-gate-message");
  const clearBtn = el.querySelector("#data-clear-btn");
  const clearFromInput = el.querySelector("#data-clear-before");
  clearFromInput.value = today;

  function updateClearGate() {
    clearGateMsg.classList.toggle("hidden", justExportedFull);
    clearBtn.disabled = !justExportedFull;
  }
  updateClearGate();

  async function refreshStorageEstimate() {
    const bytes = await estimateImageBytes();
    storageEl.textContent = bytes > 0 ? `About ${formatBytes(bytes)} of images stored on this device.` : "No images stored yet.";
  }
  refreshStorageEstimate();

  const clearResultEl = el.querySelector("#data-clear-result");
  clearBtn.addEventListener("click", async () => {
    if (!justExportedFull) return;
    const confirmSheet = openSheet("tpl-confirm-delete");
    confirmSheet.el.querySelector(".confirm-title").textContent = "Clear photos & recordings?";
    confirmSheet.el.querySelector(".confirm-message").textContent =
      `This removes the photos and voice recordings from every entry on or before ${clearFromInput.value}, freeing up space. The entries themselves — text, type, and date — stay in your log. This can't be undone.`;
    confirmSheet.el.querySelector(".confirm-btn").textContent = "Clear";
    confirmSheet.el.querySelector(".cancel-btn").addEventListener("click", () => confirmSheet.close());
    confirmSheet.el.querySelector(".confirm-btn").addEventListener("click", async () => {
      const cleared = await clearImagesInRange("0000-01-01", clearFromInput.value);
      confirmSheet.close();
      clearResultEl.textContent = `Cleared media from ${cleared} entr${cleared === 1 ? "y" : "ies"}.`;
      clearResultEl.classList.remove("hidden");
      refreshStorageEstimate();
    });
  });
}

export async function openImportSheet(refresh) {
  const sheet = openSheet("tpl-import");
  const fileInput = sheet.el.querySelector(".import-file-input");
  const messageEl = sheet.el.querySelector(".import-message");

  sheet.el.querySelector(".close-btn").addEventListener("click", () => sheet.close());
  sheet.el.querySelector(".import-file-btn").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    messageEl.classList.remove("error");

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      messageEl.textContent = "That doesn't look like valid JSON.";
      messageEl.classList.add("error");
      return;
    }
    try {
      const result = await importData(parsed);
      messageEl.textContent = result.entryCount
        ? `Imported ${result.entryCount} piece${result.entryCount !== 1 ? "s" : ""}.`
        : "Import complete.";
      if (refresh) refresh();
      setTimeout(() => sheet.close(), 900);
    } catch (err) {
      messageEl.textContent = err.message || "That doesn't look like a valid export file.";
      messageEl.classList.add("error");
    }
  });
}

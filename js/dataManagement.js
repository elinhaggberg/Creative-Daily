import {
  exportBackupData,
  exportRangeData,
  importData,
  markBackedUp,
  estimateImageBytes,
  clearImagesInRange,
  getDaysWithEntries,
  getDayNumber,
  getEntriesForDate,
  todayKey,
} from "./storage.js";
import { openSheet } from "./sheet.js";
import { shareOrDownload, shareFilesOrDownload, filenameFor } from "./share.js";
import { buildDayImageCards, exportEntryAsImage, collectVoiceFiles } from "./canvasExport.js";
import { openImagePickerSheet } from "./imagePicker.js";
import { promptSummaryFor } from "./dayDetail.js";
import { formatDate } from "./util.js";
import { typeFor } from "./entryTypes.js";
import { formatDuration } from "./entryCard.js";
import { dataUrlToBlob, fileExtensionForAudio } from "./voiceRecorder.js";

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function collectVoiceFilesForRange(fromKey, toKey) {
  const days = (await getDaysWithEntries()).filter((d) => d.dateKey >= fromKey && d.dateKey <= toKey);
  const files = [];
  for (const day of days) files.push(...(await collectVoiceFiles(day.entries, day.dateKey)));
  return files;
}

// A single day in printed form -- the day's prompt, then every entry in it.
// Shared by the multi-day booklet and a single entry's own "print this"
// action (which just calls it with a one-entry list).
function buildPrintPage(dayNumber, dateKey, entries) {
  const { category, headline, prompt } = promptSummaryFor(dateKey);

  const page = document.createElement("section");
  page.className = "print-page";
  page.innerHTML = `
    <p class="print-daynum">Day ${dayNumber} · ${formatDate(dateKey)}</p>
    <p class="print-category">${category.label}</p>
    <h2>${headline}</h2>
    ${prompt.body && prompt.title ? `<p class="print-prompt-body">${prompt.body}</p>` : ""}
    ${prompt.meta ? `<p class="print-prompt-meta">${prompt.meta}</p>` : ""}
  `;

  const entriesWrap = document.createElement("div");
  entriesWrap.className = "print-entries";
  for (const entry of entries) {
    const entryEl = document.createElement("div");
    entryEl.className = "print-entry";
    const typeLabel = document.createElement("p");
    typeLabel.className = "print-entry-type";
    typeLabel.textContent =
      entry.type === "voice" && entry.audio
        ? `${typeFor(entry.type).label} · ${formatDuration(entry.audioDuration)}`
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
      note.textContent = "🎙 Voice recording — a printed page can't play audio; use “Voice recordings” to save it separately.";
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
  return page;
}

// Injects a hidden, print-only DOM tree and triggers the browser's native
// print dialog -- "Save as PDF" in that dialog is what produces the actual
// file. No PDF library needed, and it works the same on iOS Share Sheet /
// Android / desktop print-to-PDF.
//
// window.print() needs to run synchronously inside the click handler that
// triggered it -- once real async work (an IndexedDB read, a fetch, even a
// single microtask hop on some engines) happens first, iOS Safari silently
// drops the "this came from a user gesture" permission and just never opens
// the dialog. No error, no dialog, nothing. So every caller here prefetches
// its data *before* the click (when the sheet opens, or when a date input
// changes) and this function -- and everything between the click and it --
// stays fully synchronous.
function triggerPrint(root) {
  document.body.appendChild(root);
  const cleanup = () => root.remove();
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  // Safety net for browsers that never fire afterprint (some mobile
  // webviews) -- the print dialog has certainly closed by then either way.
  setTimeout(cleanup, 60000);
}

async function buildBookletPages(fromKey, toKey) {
  const days = (await getDaysWithEntries()).filter((d) => d.dateKey >= fromKey && d.dateKey <= toKey).reverse();
  const pages = [];
  for (const day of days) {
    const dayNumber = await getDayNumber(day.dateKey);
    pages.push(buildPrintPage(dayNumber, day.dateKey, day.entries));
  }
  return pages;
}

// Builds the (optional) cover + already-built pages and prints --
// deliberately takes no async data-fetching of its own so it's safe to call
// as the very last step of a click handler (see the note on triggerPrint
// below). The cover page only makes sense once there's a real range/day to
// title -- a single piece's own PDF skips it.
function printPages(fromKey, toKey, pages, { withCover = true } = {}) {
  const root = document.createElement("div");
  root.className = "print-booklet";
  if (withCover) {
    const cover = document.createElement("section");
    cover.className = "print-page print-cover";
    cover.innerHTML = `<h1>Creative Daily</h1><p>${formatDate(fromKey)} – ${formatDate(toKey)}</p>`;
    root.appendChild(cover);
  }
  for (const page of pages) root.appendChild(page);
  triggerPrint(root);
}

// Fallback path when nothing's been prefetched -- fetches then prints. Only
// used where a prefetched cache genuinely isn't available; the direct
// click-to-print paths below avoid this specifically because of the note on
// triggerPrint.
async function printBooklet(fromKey, toKey) {
  printPages(fromKey, toKey, await buildBookletPages(fromKey, toKey));
}

// Shares/downloads directly when there's only one image (nothing to choose
// between); opens the picker sheet when there's more than one.
async function shareOrPickImages(cards) {
  if (cards.length === 0) return;
  if (cards.length === 1) {
    await shareFilesOrDownload(cards[0].files);
    return;
  }
  openImagePickerSheet(cards);
}

export async function openDayShareSheet(dateKey) {
  const sheet = openSheet("tpl-day-share");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  // Fetched once up front, before any button can be tapped, so the PDF
  // button's click handler can call window.print() with zero async gap --
  // see the note on triggerPrint.
  const [entries, dayNumber] = await Promise.all([getEntriesForDate(dateKey), getDayNumber(dateKey)]);
  const hasVoice = entries.some((e) => e.type === "voice" && e.audio);

  const voiceBtn = el.querySelector("#day-share-voice-btn");
  const voiceHint = el.querySelector("#day-share-voice-hint");
  voiceBtn.classList.toggle("hidden", !hasVoice);
  voiceHint.classList.toggle("hidden", !hasVoice);

  el.querySelector("#day-share-image-btn").addEventListener("click", async () => {
    sheet.close();
    const cards = await buildDayImageCards(dateKey);
    await shareOrPickImages(cards);
  });
  el.querySelector("#day-share-pdf-btn").addEventListener("click", () => {
    sheet.close();
    printPages(dateKey, dateKey, [buildPrintPage(dayNumber, dateKey, entries)]);
  });
  el.querySelector("#day-share-json-btn").addEventListener("click", async () => {
    const data = await exportRangeData(dateKey, dateKey);
    await shareOrDownload(filenameFor(`creative-daily-${dateKey}`), JSON.stringify(data, null, 2));
    sheet.close();
  });
  voiceBtn.addEventListener("click", async () => {
    const files = await collectVoiceFiles(entries, dateKey);
    if (files.length > 0) await shareFilesOrDownload(files);
    sheet.close();
  });
}

// Same menu as the day share sheet, scoped to one piece -- reuses the same
// template, just retitled, since a single entry is really just a day share
// with one candidate entry.
export async function openEntryShareSheet(entry, dateKey) {
  const sheet = openSheet("tpl-day-share");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());
  el.querySelector("#share-sheet-title").textContent = "Share this piece";

  // Fetched before any button can be tapped -- see the note on triggerPrint.
  const dayNumber = await getDayNumber(dateKey);

  const hasVoice = entry.type === "voice" && Boolean(entry.audio);
  const voiceBtn = el.querySelector("#day-share-voice-btn");
  const voiceHint = el.querySelector("#day-share-voice-hint");
  voiceBtn.classList.toggle("hidden", !hasVoice);
  voiceHint.classList.toggle("hidden", !hasVoice);

  el.querySelector("#day-share-image-btn").addEventListener("click", async () => {
    sheet.close();
    await exportEntryAsImage(entry, dateKey);
  });
  el.querySelector("#day-share-pdf-btn").addEventListener("click", () => {
    sheet.close();
    printPages(dateKey, dateKey, [buildPrintPage(dayNumber, dateKey, [entry])], { withCover: false });
  });
  el.querySelector("#day-share-json-btn").addEventListener("click", async () => {
    const data = { type: "creative-daily-entry", version: 1, exportedAt: new Date().toISOString(), entry };
    await shareOrDownload(filenameFor(`creative-daily-${dateKey}`), JSON.stringify(data, null, 2));
    sheet.close();
  });
  voiceBtn.addEventListener("click", async () => {
    const blob = await dataUrlToBlob(entry.audio);
    const file = new File([blob], filenameFor(`creative-daily-${dateKey}-voice`, fileExtensionForAudio(blob)), { type: blob.type });
    await shareFilesOrDownload([file]);
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

  // The range is picked live via date inputs, so it can't be prefetched
  // once up front the way a fixed day/entry share sheet can be -- instead,
  // re-render the booklet pages every time the range actually changes (a
  // "change" event, not every keystroke) and cache them, so by the time the
  // PDF button is clicked, printing it is a synchronous cache read. See the
  // note on triggerPrint for why that gap matters. Falls back to fetching
  // inline only in the unlikely case a click beats the very first prefetch.
  let bookletCache = null;
  async function refreshBookletCache() {
    if (!fromInput.value || !toInput.value) {
      bookletCache = null;
      return;
    }
    const from = fromInput.value;
    const to = toInput.value;
    const pages = await buildBookletPages(from, to);
    bookletCache = { from, to, pages };
  }
  refreshBookletCache();
  fromInput.addEventListener("change", refreshBookletCache);
  toInput.addEventListener("change", refreshBookletCache);

  el.querySelector("#data-range-pdf-btn").addEventListener("click", async () => {
    if (!fromInput.value || !toInput.value) return;
    sheet.close();
    if (bookletCache && bookletCache.from === fromInput.value && bookletCache.to === toInput.value) {
      printPages(bookletCache.from, bookletCache.to, bookletCache.pages);
    } else {
      await printBooklet(fromInput.value, toInput.value);
    }
  });
  el.querySelector("#data-range-json-btn").addEventListener("click", async () => {
    if (!fromInput.value || !toInput.value) return;
    const data = await exportRangeData(fromInput.value, toInput.value);
    await shareOrDownload(filenameFor(`creative-daily-collection-${fromInput.value}-to-${toInput.value}`), JSON.stringify(data, null, 2));
  });

  const rangeVoiceResult = el.querySelector("#data-range-voice-result");
  el.querySelector("#data-range-voice-btn").addEventListener("click", async () => {
    if (!fromInput.value || !toInput.value) return;
    const files = await collectVoiceFilesForRange(fromInput.value, toInput.value);
    if (files.length === 0) {
      rangeVoiceResult.textContent = "No voice recordings in that range.";
      rangeVoiceResult.classList.remove("hidden");
      return;
    }
    rangeVoiceResult.classList.add("hidden");
    await shareFilesOrDownload(files);
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

  // Reserve the paragraph's height with placeholder text right away --
  // estimateImageBytes() reads real stored image blobs, and going straight
  // from an empty <p> to a filled one once that resolves shifts every field
  // below it down mid-scroll on a real device (fast/empty test data hides
  // this locally since the read resolves before the sheet even paints).
  storageEl.textContent = "Checking storage…";
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

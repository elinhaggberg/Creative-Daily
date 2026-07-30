import { deleteEntry } from "./storage.js";
import { openSheet } from "./sheet.js";
import { openEntryEditor } from "./entryEditor.js";
import { typeFor } from "./entryTypes.js";
import { buildEntryMedia, buildEntryBody, formatDuration } from "./entryCard.js";
import { openEntryShareSheet } from "./dataManagement.js";

// Tapping a card opens this read-only preview first -- share/edit/delete
// live up top, same shape as My Index's snippet detail -- rather than
// dropping straight into the editor.
export function openEntryDetail(entry, { refresh }) {
  const sheet = openSheet("tpl-entry-detail");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  const type = typeFor(entry.type);
  const durationSuffix = entry.type === "voice" && entry.audio ? ` · ${formatDuration(entry.audioDuration)}` : "";
  el.querySelector("#entry-detail-badge").innerHTML = `${type.icon}<span>${type.label}${durationSuffix}</span>`;

  const mediaSlot = el.querySelector("#entry-detail-media");
  const media = buildEntryMedia(entry, { full: true });
  mediaSlot.replaceChildren(...(media ? [media] : []));

  const bodySlot = el.querySelector("#entry-detail-body");
  bodySlot.replaceChildren(...buildEntryBody(entry));

  el.querySelector("#entry-detail-edit-btn").addEventListener("click", () => {
    sheet.close();
    openEntryEditor({ entry, isNew: false, refresh });
  });

  el.querySelector("#entry-detail-share-btn").addEventListener("click", () => {
    openEntryShareSheet(entry, entry.dateKey);
  });

  el.querySelector("#entry-detail-delete-btn").addEventListener("click", () => {
    const confirmSheet = openSheet("tpl-confirm-delete");
    confirmSheet.el.querySelector(".confirm-message").textContent = "Delete this piece? This can't be undone.";
    confirmSheet.el.querySelector(".cancel-btn").addEventListener("click", () => confirmSheet.close());
    confirmSheet.el.querySelector(".confirm-btn").addEventListener("click", async () => {
      await deleteEntry(entry.id);
      confirmSheet.close();
      sheet.close();
      refresh();
    });
  });
}

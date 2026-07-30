import { deleteEntry } from "./storage.js";
import { openSheet } from "./sheet.js";
import { openEntryEditor } from "./entryEditor.js";
import { typeFor } from "./entryTypes.js";
import { buildEntryMedia, buildEntryBody, formatDuration } from "./entryCard.js";
import { shareOrDownload, shareFilesOrDownload, filenameFor } from "./share.js";
import { dataUrlToBlob, fileExtensionForAudio } from "./voiceRecorder.js";

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

  el.querySelector("#entry-detail-share-btn").addEventListener("click", async () => {
    // A voice memo shares as the actual recording (nothing else to hand
    // over); everything else exports as a single-entry JSON file, same
    // shape a full day's export uses.
    if (entry.type === "voice" && entry.audio) {
      const blob = await dataUrlToBlob(entry.audio);
      const file = new File(
        [blob],
        filenameFor(`creative-daily-${entry.dateKey}-voice`, fileExtensionForAudio(blob)),
        { type: blob.type }
      );
      await shareFilesOrDownload([file]);
      return;
    }
    const data = { type: "creative-daily-entry", version: 1, exportedAt: new Date().toISOString(), entry };
    await shareOrDownload(filenameFor(`creative-daily-${entry.dateKey}`), JSON.stringify(data, null, 2));
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

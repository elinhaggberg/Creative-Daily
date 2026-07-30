import { saveEntry, deleteEntry } from "./storage.js";
import { openSheet } from "./sheet.js";
import { readAndResizeImage, readAndResizeImages } from "./imageBlob.js";
import { ENTRY_TYPES, typeFor } from "./entryTypes.js";
import { autogrow } from "./util.js";

// Opens the capture sheet for a new or existing entry. `entry` already has
// dateKey/promptId set by the caller (today on Home, a past date from the
// Calendar or Day Detail's own "+").
export function openEntryEditor({ entry, isNew, refresh }) {
  const draft = { ...entry, images: [...(entry.images || [])] };

  const sheet = openSheet("tpl-entry-editor");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());
  el.querySelector("#entry-editor-heading").textContent = isNew ? "Add to today" : "Edit";

  const deleteBtn = el.querySelector("#entry-editor-delete-btn");
  if (isNew) {
    deleteBtn.classList.add("hidden");
  } else {
    deleteBtn.classList.remove("hidden");
    deleteBtn.addEventListener("click", () => {
      const confirmSheet = openSheet("tpl-confirm-delete");
      confirmSheet.el.querySelector(".confirm-message").textContent = "Delete this piece? This can't be undone.";
      confirmSheet.el.querySelector(".cancel-btn").addEventListener("click", () => confirmSheet.close());
      confirmSheet.el.querySelector(".confirm-btn").addEventListener("click", async () => {
        await deleteEntry(draft.id);
        confirmSheet.close();
        sheet.close();
        refresh();
      });
    });
  }

  const textInput = el.querySelector("#entry-editor-text");
  autogrow(textInput);

  const urlField = el.querySelector("#entry-editor-url-field");
  const urlInput = el.querySelector("#entry-editor-url");
  const imageActions = el.querySelector("#entry-editor-image-actions");
  const imageActionsLabel = el.querySelector("#entry-editor-image-actions-label");
  const imagePreviewWrap = el.querySelector("#entry-editor-image-preview-wrap");
  const cameraInput = el.querySelector("#entry-editor-camera-input");
  const libraryInput = el.querySelector("#entry-editor-library-input");

  function renderImagePreview() {
    imagePreviewWrap.replaceChildren();
    if (draft.images.length === 0) {
      imagePreviewWrap.classList.add("hidden");
      return;
    }
    imagePreviewWrap.classList.remove("hidden");
    draft.images.forEach((src, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "photo-preview-wrap";
      const img = document.createElement("img");
      img.className = "photo-preview";
      img.src = src;
      img.alt = "";
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "photo-preview-clear";
      clearBtn.setAttribute("aria-label", "Remove image");
      clearBtn.innerHTML = '<svg class="icon" viewBox="0 0 384 512" aria-hidden="true" focusable="false"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>';
      clearBtn.addEventListener("click", () => {
        draft.images.splice(idx, 1);
        renderImagePreview();
      });
      wrap.append(img, clearBtn);
      imagePreviewWrap.appendChild(wrap);
    });
  }

  function renderFields() {
    const type = typeFor(draft.type);
    textInput.placeholder = type.placeholder;
    textInput.rows = type.long ? 8 : 2;
    textInput.classList.toggle("editor-serif", type.serif);
    urlField.classList.toggle("hidden", type.id !== "link");
    imageActions.classList.toggle("hidden", type.id !== "image" && type.id !== "gallery");
    if (imageActionsLabel) imageActionsLabel.textContent = type.id === "gallery" ? "Add photos" : "Add photo";
    libraryInput.multiple = type.id === "gallery";
    cameraInput.multiple = false;
    imagePreviewWrap.classList.toggle("gallery-grid", type.id === "gallery" && draft.images.length > 1);
    renderImagePreview();
  }

  const typeRow = el.querySelector("#entry-editor-type-row");
  typeRow.replaceChildren(
    ...ENTRY_TYPES.map((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "type-chip" + (draft.type === t.id ? " active" : "");
      btn.innerHTML = `${t.icon}<span>${t.label}</span>`;
      btn.addEventListener("click", () => {
        draft.type = t.id;
        typeRow.querySelectorAll(".type-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderFields();
      });
      return btn;
    })
  );

  textInput.value = draft.text || "";
  textInput.addEventListener("input", () => {
    draft.text = textInput.value;
  });

  urlInput.value = draft.url || "";
  urlInput.addEventListener("input", () => {
    draft.url = urlInput.value.trim();
  });

  el.querySelector("#entry-editor-camera-btn").addEventListener("click", () => cameraInput.click());
  el.querySelector("#entry-editor-library-btn").addEventListener("click", () => libraryInput.click());

  async function addImages(files) {
    if (!files || files.length === 0) return;
    try {
      if (draft.type === "gallery") {
        const resized = await readAndResizeImages(files);
        draft.images.push(...resized);
      } else {
        draft.images = [await readAndResizeImage(files[0])];
      }
      renderFields();
    } catch {
      // Unreadable file -- leave the picker as-is so they can retry.
    }
  }
  cameraInput.addEventListener("change", () => addImages(cameraInput.files));
  libraryInput.addEventListener("change", () => addImages(libraryInput.files));

  renderFields();

  const saveErrorEl = el.querySelector("#entry-editor-save-error");
  el.querySelector("#entry-editor-save-btn").addEventListener("click", async () => {
    const finalText = (draft.text || "").trim();
    const hasContent = finalText || draft.images.length > 0 || (draft.type === "link" && draft.url);
    if (!hasContent) {
      saveErrorEl.textContent = "Add some words, a link, or a photo before saving.";
      saveErrorEl.classList.remove("hidden");
      return;
    }
    try {
      await saveEntry({ ...draft, text: finalText });
    } catch {
      saveErrorEl.textContent = "Couldn't save. Please try again.";
      saveErrorEl.classList.remove("hidden");
      return;
    }
    sheet.close();
    refresh();
  });
}

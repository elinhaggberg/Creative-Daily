import { saveEntry, deleteEntry } from "./storage.js";
import { openSheet } from "./sheet.js";
import { readAndResizeImage, readAndResizeImages } from "./imageBlob.js";
import { startRecording, blobToDataUrl, RECORDING_SUPPORTED } from "./voiceRecorder.js";
import { ENTRY_TYPES, typeFor } from "./entryTypes.js";
import { autogrow } from "./util.js";

// Opens the capture sheet for a new or existing entry. `entry` already has
// dateKey/promptId set by the caller (today on Home, a past date from the
// Calendar or Day Detail's own "+").
export function openEntryEditor({ entry, isNew, refresh }) {
  const draft = { ...entry, images: [...(entry.images || [])], audio: entry.audio || "", audioDuration: entry.audioDuration || 0 };

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
    voiceSection.classList.toggle("hidden", type.id !== "voice");
    if (type.id === "voice") renderVoiceState();
  }

  const typeRow = el.querySelector("#entry-editor-type-row");
  typeRow.replaceChildren(
    ...ENTRY_TYPES.map((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "type-chip" + (draft.type === t.id ? " active" : "");
      btn.innerHTML = `${t.icon}<span>${t.label}</span>`;
      btn.addEventListener("click", () => {
        if (draft.type === "voice" && t.id !== "voice" && activeRecorder) cancelRecording();
        draft.type = t.id;
        typeRow.querySelectorAll(".type-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderFields();
      });
      return btn;
    })
  );

  // ---- Voice memo recording ----
  const voiceSection = el.querySelector("#entry-editor-voice-section");
  const voiceIdle = el.querySelector("#voice-idle");
  const voiceActive = el.querySelector("#voice-active");
  const voiceDone = el.querySelector("#voice-done");
  const voiceRecordBtn = el.querySelector("#voice-record-btn");
  const voiceStopBtn = el.querySelector("#voice-stop-btn");
  const voiceRerecordBtn = el.querySelector("#voice-rerecord-btn");
  const voiceClearBtn = el.querySelector("#voice-clear-btn");
  const voiceTimeEl = el.querySelector("#voice-rec-time");
  const voiceAudioEl = el.querySelector("#voice-audio-preview");
  const voiceErrorEl = el.querySelector("#voice-error");

  let activeRecorder = null;
  let voiceTimerId = null;

  function renderVoiceState() {
    const hasAudio = Boolean(draft.audio);
    voiceIdle.classList.toggle("hidden", hasAudio);
    voiceDone.classList.toggle("hidden", !hasAudio);
    voiceActive.classList.add("hidden");
    if (hasAudio) voiceAudioEl.src = draft.audio;
  }

  function cancelRecording() {
    clearInterval(voiceTimerId);
    if (activeRecorder) activeRecorder.cancel();
    activeRecorder = null;
  }

  async function beginRecording() {
    if (!RECORDING_SUPPORTED) {
      voiceErrorEl.textContent = "This browser doesn't support voice recording.";
      voiceErrorEl.classList.remove("hidden");
      return;
    }
    voiceErrorEl.classList.add("hidden");
    try {
      activeRecorder = await startRecording();
    } catch {
      voiceErrorEl.textContent = "Couldn't access the microphone.";
      voiceErrorEl.classList.remove("hidden");
      return;
    }
    voiceIdle.classList.add("hidden");
    voiceDone.classList.add("hidden");
    voiceActive.classList.remove("hidden");
    const startedAt = Date.now();
    voiceTimeEl.textContent = "0:00";
    voiceTimerId = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt) / 1000);
      voiceTimeEl.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    }, 250);
  }

  async function finishRecording() {
    if (!activeRecorder) return;
    clearInterval(voiceTimerId);
    const recorder = activeRecorder;
    activeRecorder = null;
    const { blob, duration } = await recorder.stop();
    draft.audio = await blobToDataUrl(blob);
    draft.audioDuration = duration;
    renderVoiceState();
  }

  voiceRecordBtn.addEventListener("click", beginRecording);
  voiceStopBtn.addEventListener("click", finishRecording);
  voiceRerecordBtn.addEventListener("click", () => {
    draft.audio = "";
    draft.audioDuration = 0;
    renderVoiceState();
    beginRecording();
  });
  voiceClearBtn.addEventListener("click", () => {
    draft.audio = "";
    draft.audioDuration = 0;
    renderVoiceState();
  });

  // Safety net: if the sheet gets dismissed (backdrop tap, not just the
  // close button) while the mic is live, stop the stream instead of leaving
  // it running in the background.
  const cleanupObserver = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      cancelRecording();
      cleanupObserver.disconnect();
    }
  });
  cleanupObserver.observe(document.body, { childList: true });

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
    if (activeRecorder) await finishRecording();
    const finalText = (draft.text || "").trim();
    const hasContent = finalText || draft.images.length > 0 || draft.audio || (draft.type === "link" && draft.url);
    if (!hasContent) {
      saveErrorEl.textContent = "Add some words, a link, a photo, or a recording before saving.";
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

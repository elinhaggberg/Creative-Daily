export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// The reverse of blobToDataUrl -- needed to turn a stored recording back
// into an actual playable/shareable file, since neither the PNG nor the PDF
// export can embed audio (both are static). fetch() on a data: URI is a
// synchronous decode under the hood, not a network request.
export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

const EXT_FOR_MIME = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/mpeg": "mp3" };

export function fileExtensionForAudio(blob) {
  return EXT_FOR_MIME[blob.type] || "webm";
}

export const RECORDING_SUPPORTED =
  typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// Requests the mic and starts recording immediately -- the caller drives
// start/stop timing from the UI (a record button), this just wraps the
// MediaRecorder plumbing. mimeType is whatever the browser actually
// supports, picked once here rather than assumed, since Safari and Chrome
// don't agree on one.
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  recorder.addEventListener("dataavailable", (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  });
  const startedAt = Date.now();
  recorder.start();

  function stopStream() {
    stream.getTracks().forEach((t) => t.stop());
  }

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.addEventListener(
          "stop",
          () => {
            stopStream();
            const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
            resolve({ blob, duration: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) });
          },
          { once: true }
        );
        recorder.stop();
      }),
    cancel: () => {
      recorder.addEventListener("stop", stopStream, { once: true });
      try {
        recorder.stop();
      } catch {
        stopStream();
      }
    },
  };
}

export function filenameFor(prefix, ext = "json") {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (prefix || "creative-daily").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "creative-daily"}-${stamp}.${ext}`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Tries the native share sheet first (best for "send this to someone" or
// "save to Files" on a phone); falls back to a plain download anywhere that
// isn't supported.
async function shareFileOrDownload(file) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
    }
  }
  downloadBlob(file.name, file);
  return "downloaded";
}

export async function shareOrDownload(filename, content, mimeType = "application/json") {
  return shareFileOrDownload(new File([content], filename, { type: mimeType }));
}

export async function shareImageOrDownload(filename, blob) {
  return shareFileOrDownload(new File([blob], filename, { type: blob.type || "image/png" }));
}

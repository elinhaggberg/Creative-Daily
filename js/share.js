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
// "save to Files" on a phone, and the only way to hand over *several* files
// -- e.g. a day's summary image plus its voice recordings -- as one action);
// falls back to downloading each file individually anywhere that isn't
// supported.
async function shareFilesOrDownload(files) {
  if (navigator.canShare && navigator.canShare({ files })) {
    try {
      await navigator.share({ files });
      return "shared";
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
    }
  }
  for (const file of files) downloadBlob(file.name, file);
  return "downloaded";
}

export async function shareOrDownload(filename, content, mimeType = "application/json") {
  return shareFilesOrDownload([new File([content], filename, { type: mimeType })]);
}

export { shareFilesOrDownload };

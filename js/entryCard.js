import { typeFor } from "./entryTypes.js";
import { hostnameFor } from "./util.js";
import { ICON_EXTERNAL, ICON_IMAGE, ICON_MIC } from "./icons.js";

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Builds one entry card for the day view (Home's "today", My Log's day
// detail, and the print booklet reuse the same node shape). `onOpen` is
// called with the entry when the card itself is tapped (opens the editor).
export function createEntryNode(entry, onOpen) {
  const type = typeFor(entry.type);
  const article = document.createElement("article");
  article.className = "entry-card";

  const strip = document.createElement("div");
  strip.className = "entry-card-strip";
  const durationSuffix = entry.type === "voice" && entry.audio ? ` · ${formatDuration(entry.audioDuration)}` : "";
  strip.innerHTML = `<span class="entry-card-type-icon">${type.icon}</span><span class="entry-card-type-label">${type.label}${durationSuffix}</span>`;
  article.appendChild(strip);

  if (entry.type === "voice" && entry.audio) {
    const wrap = document.createElement("div");
    wrap.className = "entry-card-audio-wrap";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = entry.audio;
    audio.addEventListener("click", (e) => e.stopPropagation());
    wrap.appendChild(audio);
    article.appendChild(wrap);
  } else if (entry.type === "image" && entry.images[0]) {
    const img = document.createElement("img");
    img.className = "entry-card-media";
    img.loading = "lazy";
    img.src = entry.images[0];
    img.alt = "";
    article.appendChild(img);
  } else if (entry.type === "gallery" && entry.images.length > 0) {
    const grid = document.createElement("div");
    grid.className = "entry-card-gallery-grid";
    for (const src of entry.images.slice(0, 4)) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = src;
      img.alt = "";
      grid.appendChild(img);
    }
    if (entry.images.length > 4) {
      const more = document.createElement("span");
      more.className = "entry-card-gallery-more";
      more.textContent = `+${entry.images.length - 4}`;
      grid.lastChild.after(more);
    }
    article.appendChild(grid);
  } else if ((entry.type === "note" || entry.type === "story" || entry.type === "poem") && entry.images[0]) {
    const img = document.createElement("img");
    img.className = "entry-card-media";
    img.loading = "lazy";
    img.src = entry.images[0];
    img.alt = "";
    article.appendChild(img);
  } else if (entry.imagesCleared) {
    const isVoice = entry.type === "voice";
    const placeholder = document.createElement("div");
    placeholder.className = "entry-card-cleared";
    placeholder.innerHTML = `${isVoice ? ICON_MIC : ICON_IMAGE}<span>${isVoice ? "Recording" : "Image"} removed to save space</span>`;
    article.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.className = "entry-card-body";

  if (entry.type === "link" && entry.url) {
    const link = document.createElement("div");
    link.className = "entry-card-link-row";
    link.innerHTML = `${ICON_EXTERNAL}<span>${hostnameFor(entry.url) || entry.url}</span>`;
    body.appendChild(link);
  }

  if (entry.text) {
    const p = document.createElement("p");
    p.className = "entry-card-text";
    if (entry.type === "poem") p.classList.add("entry-text-poem");
    if (entry.type === "story") p.classList.add("entry-text-story");
    p.textContent = entry.text;
    body.appendChild(p);
  }

  if (body.children.length > 0) article.appendChild(body);

  article.addEventListener("click", () => onOpen(entry));
  return article;
}

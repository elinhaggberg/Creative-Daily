import { getEntriesForDate, getDayNumber } from "./storage.js";
import { promptSummaryFor } from "./dayDetail.js";
import { formatPromptDate, hostnameFor } from "./util.js";
import { formatDuration } from "./entryCard.js";
import { shareFilesOrDownload, filenameFor } from "./share.js";
import { dataUrlToBlob, fileExtensionForAudio } from "./voiceRecorder.js";

// A fixed 4:5 "Instagram portrait feed" canvas, one per piece -- deliberately
// not themed to the visitor's current in-app light/dark/accent choice, the
// way a printed photo doesn't change with the room lighting. Personalizes
// only through the accent color, everything else (paper, ink) stays put so
// the card is legible wherever it ends up shared.
const CARD_W = 1080;
const CARD_H = 1350;
const PAD = 90;
const CONTENT_W = CARD_W - PAD * 2;
const HEADLINE_MAX_LINES = 3;

const BG = "#f7f0e4";
const TEXT = "#2b2620";
const TEXT_DIM = "#8a7f6d";
const BORDER = "#e3d7b8";
const CARD_TINT = "#efe6d0";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(`${text.slice(0, mid)}…`).width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return `${text.slice(0, lo).trimEnd()}…`;
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Bigger, punchier type for shorter pieces -- reads like a pull-quote card
// instead of a wall of small text.
function quoteFontSize(text) {
  const len = text.length;
  if (len <= 40) return 60;
  if (len <= 90) return 50;
  if (len <= 160) return 40;
  if (len <= 280) return 32;
  return 26;
}

// Every content block is built the same way regardless of type: measure
// first (so its height is known), return { height, draw(startY, centerX) }.
// That lets the caller vertically center whatever comes back without each
// branch having to duplicate the centering math. `galleryImages`, when
// given, is the specific slice of a Gallery entry's photos this particular
// card should show -- see buildEntryImageCards, which splits a gallery
// bigger than one card can hold into several cards instead of silently
// dropping everything past the first 4.
async function buildContentBlock(ctx, entry, galleryImages) {
  if ((entry.type === "image" || entry.type === "note" || entry.type === "story" || entry.type === "poem") && entry.images?.[0]) {
    return buildImageBlock(ctx, entry, [entry.images[0]]);
  }
  if (entry.type === "gallery" && entry.images?.length) {
    return buildImageBlock(ctx, entry, galleryImages || entry.images.slice(0, 4));
  }
  if (entry.type === "link" && entry.url) {
    return buildLinkBlock(ctx, entry);
  }
  if (entry.type === "voice" && entry.audio) {
    return buildVoiceBlock(ctx, entry);
  }
  if (entry.text) {
    return buildQuoteBlock(ctx, entry);
  }
  return { height: 0, draw() {} };
}

function buildCaptionLines(ctx, entry, maxLines = 4) {
  if (!entry.text) return [];
  ctx.font = `italic 32px ${SERIF}`;
  return wrapText(ctx, entry.text, CONTENT_W).slice(0, maxLines);
}

async function buildImageBlock(ctx, entry, srcs) {
  const images = await Promise.all(srcs.map((src) => loadImage(src).catch(() => null))).then((r) => r.filter(Boolean));
  const captionLines = buildCaptionLines(ctx, entry);
  const captionGap = captionLines.length ? 28 : 0;
  const captionLineHeight = 42;

  if (images.length === 0) return { height: 0, draw() {} };

  if (images.length === 1) {
    const img = images[0];
    let w = CONTENT_W;
    let h = (img.height / img.width) * w;
    const maxH = 780;
    if (h > maxH) {
      h = maxH;
      w = (img.width / img.height) * h;
    }
    const totalHeight = h + captionGap + captionLines.length * captionLineHeight;
    return {
      height: totalHeight,
      draw(startY, centerX) {
        const x = centerX - w / 2;
        roundedRectPath(ctx, x, startY, w, h, 28);
        ctx.save();
        ctx.clip();
        ctx.drawImage(img, x, startY, w, h);
        ctx.restore();
        drawCaption(ctx, captionLines, startY + h + captionGap, centerX, captionLineHeight);
      },
    };
  }

  // Gallery: a 2-column grid of square, cover-cropped cells, same idea as
  // the in-app gallery card.
  const gap = 16;
  const cols = 2;
  const rows = Math.ceil(images.length / cols);
  const cellW = (CONTENT_W - gap * (cols - 1)) / cols;
  const cellH = cellW;
  const gridH = cellH * rows + gap * (rows - 1);
  const totalHeight = gridH + captionGap + captionLines.length * captionLineHeight;

  return {
    height: totalHeight,
    draw(startY, centerX) {
      const x0 = centerX - CONTENT_W / 2;
      images.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = x0 + col * (cellW + gap);
        const y = startY + row * (cellH + gap);
        roundedRectPath(ctx, x, y, cellW, cellH, 22);
        ctx.save();
        ctx.clip();
        const scale = Math.max(cellW / img.width, cellH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
        ctx.restore();
      });
      drawCaption(ctx, captionLines, startY + gridH + captionGap, centerX, captionLineHeight);
    },
  };
}

function buildQuoteBlock(ctx, entry) {
  const isPoem = entry.type === "poem";
  const isStory = entry.type === "story";
  const fontSize = quoteFontSize(entry.text);
  const font = isPoem ? `italic ${fontSize}px ${SERIF}` : isStory ? `${fontSize}px ${SERIF}` : `${fontSize}px ${SANS}`;
  ctx.font = font;
  const insetW = CONTENT_W - 40;
  const lines = wrapText(ctx, entry.text, insetW);
  const lineHeight = Math.round(fontSize * 1.45);
  return {
    height: lines.length * lineHeight,
    draw(startY, centerX) {
      ctx.fillStyle = TEXT;
      ctx.font = font;
      ctx.textAlign = "center";
      let cy = startY + lineHeight * 0.8;
      for (const line of lines) {
        ctx.fillText(line, centerX, cy);
        cy += lineHeight;
      }
      ctx.textAlign = "left";
    },
  };
}

function buildLinkBlock(ctx, entry) {
  const hostname = hostnameFor(entry.url) || entry.url;
  const cardH = 220;
  const captionLines = buildCaptionLines(ctx, entry, 3);
  const gap = captionLines.length ? 30 : 0;
  const captionLineHeight = 42;
  return {
    height: cardH + gap + captionLines.length * captionLineHeight,
    draw(startY, centerX) {
      const x = centerX - CONTENT_W / 2;
      roundedRectPath(ctx, x, startY, CONTENT_W, cardH, 28);
      ctx.fillStyle = CARD_TINT;
      ctx.fill();
      ctx.textAlign = "center";
      ctx.font = `62px ${SANS}`;
      ctx.fillText("🔗", centerX, startY + 92);
      ctx.fillStyle = TEXT;
      ctx.font = `700 42px ${SANS}`;
      ctx.fillText(hostname, centerX, startY + 165);
      ctx.textAlign = "left";
      drawCaption(ctx, captionLines, startY + cardH + gap, centerX, captionLineHeight);
    },
  };
}

function buildVoiceBlock(ctx, entry) {
  const durationText = formatDuration(entry.audioDuration);
  const iconBlockH = 260;
  const captionLines = buildCaptionLines(ctx, entry, 3);
  const gap = captionLines.length ? 30 : 0;
  const captionLineHeight = 42;
  return {
    height: iconBlockH + gap + captionLines.length * captionLineHeight,
    draw(startY, centerX) {
      ctx.textAlign = "center";
      ctx.font = `140px ${SANS}`;
      ctx.fillText("🎙️", centerX, startY + 150);
      ctx.fillStyle = TEXT;
      ctx.font = `700 44px ${SANS}`;
      ctx.fillText(durationText, centerX, startY + 228);
      ctx.textAlign = "left";
      drawCaption(ctx, captionLines, startY + iconBlockH + gap, centerX, captionLineHeight);
    },
  };
}

function drawCaption(ctx, lines, startY, centerX, lineHeight) {
  if (!lines.length) return;
  ctx.fillStyle = TEXT_DIM;
  ctx.font = `italic 32px ${SERIF}`;
  ctx.textAlign = "center";
  let cy = startY + lineHeight * 0.75;
  for (const line of lines) {
    ctx.fillText(line, centerX, cy);
    cy += lineHeight;
  }
  ctx.textAlign = "left";
}

// Renders one piece as a shareable 1080x1350 card: the day's prompt for
// context up top, that piece's own content centered in the middle, a small
// footer at the bottom. Drawn with the Canvas 2D API alone. `galleryImages`
// (see buildContentBlock) lets a caller render just one chunk of a larger
// Gallery entry's photos onto this card.
export async function renderEntryImageCard(entry, { dateKey, dayNumber, galleryImages }) {
  const { category, headline, prompt } = promptSummaryFor(dateKey);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#3b2352";

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // A compact header -- the prompt is context, not the headline act, so it
  // stays small and out of the way, leaving the piece itself the bulk of
  // the card (see the CONTENT_H comment below for how that space is split).
  // The prompt type sits on its own line above the headline, rather than
  // crowding in beside it, for a cleaner stack: label, type, headline.
  const centerX = CARD_W / 2;
  let y = 90;
  ctx.textAlign = "center";
  ctx.fillStyle = TEXT_DIM;
  ctx.font = `700 24px ${SANS}`;
  ctx.fillText("TODAY'S PROMPT", centerX, y);
  y += 40;

  ctx.fillStyle = accent;
  ctx.font = `700 22px ${SANS}`;
  ctx.fillText(category.label.toUpperCase(), centerX, y);
  y += 40;

  // A quoted excerpt (see TEXTS in prompts.js) uses " / " to mark its own
  // poetic line breaks -- honor those as real line breaks rather than
  // wrapping wherever the text happens to run out of width, then word-wrap
  // within that. Capped at a few lines (with an attribution line below, if
  // this prompt has one) so a long excerpt still can't take over the card
  // from the piece it's meant to be context for.
  ctx.font = `36px ${SERIF}`;
  const wrappedHeadline = wrapText(ctx, headline.split(" / ").join("\n"), CONTENT_W);
  const headlineLines = wrappedHeadline.slice(0, HEADLINE_MAX_LINES);
  if (wrappedHeadline.length > HEADLINE_MAX_LINES) {
    headlineLines[HEADLINE_MAX_LINES - 1] = truncateToWidth(ctx, headlineLines[HEADLINE_MAX_LINES - 1], CONTENT_W);
  }
  ctx.fillStyle = TEXT;
  for (const line of headlineLines) {
    ctx.fillText(line, centerX, y);
    y += 42;
  }

  if (prompt.meta) {
    ctx.font = `italic 22px ${SANS}`;
    ctx.fillStyle = TEXT_DIM;
    ctx.fillText(truncateToWidth(ctx, `— ${prompt.meta}`, CONTENT_W), centerX, y);
    y += 34;
  } else {
    y += 4;
  }
  ctx.textAlign = "left";

  ctx.strokeStyle = BORDER;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CARD_W - PAD, y);
  ctx.stroke();
  y += 44;

  const contentTop = y;
  const contentBottom = CARD_H - 170;
  const contentHeight = contentBottom - contentTop;

  const block = await buildContentBlock(ctx, entry, galleryImages);
  const startY = contentTop + Math.max(0, (contentHeight - block.height) / 2);
  block.draw(Math.min(startY, Math.max(contentTop, contentBottom - block.height)), centerX);

  ctx.fillStyle = TEXT_DIM;
  ctx.font = `22px ${SANS}`;
  ctx.textAlign = "left";
  ctx.fillText(`Day ${dayNumber} · ${formatPromptDate(dateKey)}`, PAD, CARD_H - 100);
  ctx.textAlign = "right";
  ctx.fillText("Made with Creative Daily", CARD_W - PAD, CARD_H - 100);
  ctx.textAlign = "left";

  return canvas;
}

// Voice recordings can't be embedded in a PNG or a printed PDF -- both are
// static -- so instead of silently dropping them, every export path bundles
// the actual audio file(s) alongside whatever *can* be rendered, as
// separate files in the same share action (or separate downloads, wherever
// multi-file share isn't supported).
export async function collectVoiceFiles(entries, dateKey) {
  const voiceEntries = entries.filter((e) => e.type === "voice" && e.audio);
  const files = await Promise.all(
    voiceEntries.map(async (entry, i) => {
      const blob = await dataUrlToBlob(entry.audio);
      const ext = fileExtensionForAudio(blob);
      const suffix = voiceEntries.length > 1 ? `-${i + 1}` : "";
      return new File([blob], filenameFor(`creative-daily-${dateKey}-voice${suffix}`, ext), { type: blob.type });
    })
  );
  return files;
}

async function buildEntryImageFiles(entry, dateKey, dayNumber, suffix = "", galleryImages) {
  const canvas = await renderEntryImageCard(entry, { dateKey, dayNumber, galleryImages });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const pngFile = new File([blob], filenameFor(`creative-daily-${dateKey}${suffix}`, "png"), { type: "image/png" });
  const files = [pngFile];
  if (entry.type === "voice" && entry.audio) {
    const audioBlob = await dataUrlToBlob(entry.audio);
    files.push(
      new File([audioBlob], filenameFor(`creative-daily-${dateKey}${suffix}-voice`, fileExtensionForAudio(audioBlob)), {
        type: audioBlob.type,
      })
    );
  }
  return { pngDataUrl: canvas.toDataURL("image/png"), files };
}

// A share card's gallery grid only has room for 4 photos -- a bigger
// Gallery entry used to just silently drop everything past the first 4.
// Instead, split it into as many 4-photo cards as it takes and let
// shareOrPickImages (dataManagement.js) offer them the same way a day with
// several pieces already offers its cards: pick which ones you want.
const GALLERY_CARD_CHUNK = 4;

// Renders one piece's card(s): a single card for anything that isn't an
// oversized Gallery, or one card per 4-photo chunk for a Gallery bigger
// than that. Either way, the caller decides whether to share directly (one
// card) or open the picker (more than one) -- see shareOrPickImages.
export async function buildEntryImageCards(entry, dateKey) {
  const dayNumber = await getDayNumber(dateKey);
  if (entry.type !== "gallery" || !entry.images || entry.images.length <= GALLERY_CARD_CHUNK) {
    const { pngDataUrl, files } = await buildEntryImageFiles(entry, dateKey, dayNumber);
    return [{ id: entry.id, dataUrl: pngDataUrl, files }];
  }

  const chunks = [];
  for (let i = 0; i < entry.images.length; i += GALLERY_CARD_CHUNK) {
    chunks.push(entry.images.slice(i, i + GALLERY_CARD_CHUNK));
  }
  return Promise.all(
    chunks.map(async (chunk, i) => {
      const { pngDataUrl, files } = await buildEntryImageFiles(entry, dateKey, dayNumber, `-${i + 1}`, chunk);
      return { id: `${entry.id}-${i + 1}`, dataUrl: pngDataUrl, files };
    })
  );
}

// Renders every piece logged that day as its own card. A single-piece day
// shares directly (nothing to choose between); multiple pieces open the
// picker sheet so the choice of which to keep is explicit rather than
// silently bundling everything into one share action.
export async function buildDayImageCards(dateKey) {
  const [entries, dayNumber] = await Promise.all([getEntriesForDate(dateKey), getDayNumber(dateKey)]);
  return Promise.all(
    entries.map(async (entry, i) => {
      const suffix = entries.length > 1 ? `-${i + 1}` : "";
      const { pngDataUrl, files } = await buildEntryImageFiles(entry, dateKey, dayNumber, suffix);
      return { id: entry.id, dataUrl: pngDataUrl, files };
    })
  );
}

export async function exportDayVoiceRecordings(dateKey) {
  const entries = await getEntriesForDate(dateKey);
  const voiceFiles = await collectVoiceFiles(entries, dateKey);
  if (voiceFiles.length === 0) return "none";
  return shareFilesOrDownload(voiceFiles);
}

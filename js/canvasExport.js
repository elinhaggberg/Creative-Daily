import { getEntriesForDate, getDayNumber } from "./storage.js";
import { promptSummaryFor } from "./dayDetail.js";
import { formatPromptDate } from "./util.js";
import { typeFor } from "./entryTypes.js";
import { shareImageOrDownload, filenameFor } from "./share.js";

const CANVAS_WIDTH = 1000;
const PADDING = 56;
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING * 2;

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

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

// Renders a day's prompt + entries as one tall canvas image -- a shareable
// "page" of that day's practice, drawn with the Canvas 2D API alone (no
// external rendering library needed).
export async function renderDayCanvas(dateKey) {
  const entries = await getEntriesForDate(dateKey);
  const dayNumber = await getDayNumber(dateKey);
  const { category, headline, prompt } = promptSummaryFor(dateKey);

  const images = await Promise.all(
    entries.map((e) => (e.images && e.images[0] ? loadImage(e.images[0]).catch(() => null) : Promise.resolve(null)))
  );

  const scale = 2;
  const measure = document.createElement("canvas").getContext("2d");

  // First pass: measure total height.
  let y = PADDING;
  y += 34; // "Day N"
  y += 8;
  measure.font = "600 40px Georgia, serif";
  y += wrapText(measure, headline, CONTENT_WIDTH).length * 48 + 44;
  if (prompt.body && prompt.title) {
    measure.font = "italic 22px Georgia, serif";
    y += wrapText(measure, prompt.body, CONTENT_WIDTH).length * 30 + 10;
  }
  y += 40; // divider + spacing

  const entryLayouts = entries.map((entry, i) => {
    let h = 30; // type label
    const img = images[i];
    let imgW = 0, imgH = 0;
    if (img) {
      imgW = Math.min(CONTENT_WIDTH, img.width);
      imgH = (img.height / img.width) * imgW;
      const maxImgH = 520;
      if (imgH > maxImgH) {
        imgH = maxImgH;
        imgW = (img.width / img.height) * imgH;
      }
      h += imgH + 20;
    }
    let lines = [];
    if (entry.text) {
      measure.font = entry.type === "poem" || entry.type === "story" ? "22px Georgia, serif" : "20px -apple-system, sans-serif";
      lines = wrapText(measure, entry.text, CONTENT_WIDTH);
      h += lines.length * 30 + 10;
    }
    h += 34; // spacing after
    return { entry, img, imgW, imgH, lines, height: h };
  });

  y += entryLayouts.reduce((sum, l) => sum + l.height, 0);
  y += 50; // footer

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH * scale;
  canvas.height = y * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--surface").trim() || "#fffcf4";
  const text = styles.getPropertyValue("--text").trim() || "#241c1c";
  const textDim = styles.getPropertyValue("--text-dim").trim() || "#8a7f6d";
  const accent = styles.getPropertyValue("--accent").trim() || "#b9a6ff";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, y);

  let cursorY = PADDING;
  ctx.fillStyle = textDim;
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText(`Day ${dayNumber} · ${formatPromptDate(dateKey)}`, PADDING, cursorY + 26);
  cursorY += 34 + 8;

  ctx.fillStyle = accent;
  ctx.font = "700 15px -apple-system, sans-serif";
  ctx.fillText(category.label.toUpperCase(), PADDING, cursorY);
  cursorY += 8;

  ctx.fillStyle = text;
  ctx.font = "600 40px Georgia, serif";
  const headlineLines = wrapText(ctx, headline, CONTENT_WIDTH);
  for (const line of headlineLines) {
    cursorY += 48;
    ctx.fillText(line, PADDING, cursorY);
  }
  cursorY += 44;

  if (prompt.body && prompt.title) {
    ctx.fillStyle = textDim;
    ctx.font = "italic 22px Georgia, serif";
    for (const line of wrapText(ctx, prompt.body, CONTENT_WIDTH)) {
      cursorY += 30;
      ctx.fillText(line, PADDING, cursorY);
    }
    cursorY += 10;
  }

  ctx.strokeStyle = styles.getPropertyValue("--border").trim() || "#e3d7b8";
  ctx.beginPath();
  ctx.moveTo(PADDING, cursorY + 20);
  ctx.lineTo(CANVAS_WIDTH - PADDING, cursorY + 20);
  ctx.stroke();
  cursorY += 40;

  for (const layout of entryLayouts) {
    ctx.fillStyle = accent;
    ctx.font = "700 13px -apple-system, sans-serif";
    const typeLabel = typeFor(layout.entry.type).label.toUpperCase();
    const durationSuffix = layout.entry.type === "voice" && layout.entry.audio ? ` · ${formatDuration(layout.entry.audioDuration)}` : "";
    ctx.fillText(typeLabel + durationSuffix, PADDING, cursorY);
    cursorY += 24;

    if (layout.img) {
      ctx.drawImage(layout.img, PADDING, cursorY, layout.imgW, layout.imgH);
      cursorY += layout.imgH + 20;
    }

    if (layout.lines.length) {
      ctx.fillStyle = text;
      ctx.font = layout.entry.type === "poem" || layout.entry.type === "story" ? "22px Georgia, serif" : "20px -apple-system, sans-serif";
      for (const line of layout.lines) {
        cursorY += 30;
        ctx.fillText(line, PADDING, cursorY);
      }
      cursorY += 10;
    }
    cursorY += 34;
  }

  ctx.fillStyle = textDim;
  ctx.font = "13px -apple-system, sans-serif";
  ctx.fillText("Made with Creative Daily", PADDING, cursorY + 20);

  return canvas;
}

export async function exportDayAsImage(dateKey) {
  const canvas = await renderDayCanvas(dateKey);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return shareImageOrDownload(filenameFor(`creative-daily-${dateKey}`, "png"), blob);
}

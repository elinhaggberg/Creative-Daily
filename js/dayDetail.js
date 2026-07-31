import { getEntriesForDate, getDayNumber, createEmptyEntry, todayKey } from "./storage.js";
import { promptForDate, getPrompt, PROMPT_CATEGORIES, youtubeSearchUrl, googleImagesSearchUrl } from "./prompts.js";
import { openSheet } from "./sheet.js";
import { openEntryEditor } from "./entryEditor.js";
import { openEntryDetail } from "./entryDetail.js";
import { createEntryNode } from "./entryCard.js";
import { renderDayEntries } from "./masonry.js";
import { formatPromptDate, formatDate } from "./util.js";
import { ICON_PLUS, ICON_SHARE } from "./icons.js";
import { openDayShareSheet } from "./dataManagement.js";

// Builds the "today's creative prompt" presentation -- shared by Home
// (today, always visible) and Day Detail (any past/future day, inside a
// sheet). Two variants of the same content: "hero" is the bare, centered,
// literary presentation Home shows before anything's been logged for the
// day; "card" is the boxed, compact version it settles into once there's at
// least one piece to sit above (and what Day Detail always uses, since it's
// already inside a sheet with its own chrome).
export function buildPromptCard(dateKey, { heading = "Today's creative prompt", variant = "card" } = {}) {
  const prompt = promptForDate(new Date(`${dateKey}T00:00:00`));
  const category = PROMPT_CATEGORIES[prompt.category];
  const isHero = variant === "hero";

  const card = document.createElement("div");
  card.className = isHero ? "prompt-hero" : "prompt-card";

  if (isHero) {
    const heading_ = document.createElement("p");
    heading_.className = "prompt-hero-heading";
    heading_.textContent = heading;
    card.appendChild(heading_);
  } else {
    const head = document.createElement("div");
    head.className = "prompt-card-head";
    head.innerHTML = `<p class="prompt-card-heading">${heading}</p><p class="prompt-card-date">${formatPromptDate(dateKey)}</p>`;
    card.appendChild(head);
  }

  const badge = document.createElement("span");
  badge.className = isHero ? "prompt-hero-category" : "prompt-card-badge";
  badge.textContent = isHero ? category.label.toUpperCase() : category.label;
  card.appendChild(badge);

  const title = document.createElement("p");
  title.className = isHero ? "prompt-hero-title" : "prompt-card-title";
  title.textContent = prompt.title || prompt.body;
  card.appendChild(title);

  if (prompt.title && prompt.body) {
    const body = document.createElement("p");
    body.className = isHero ? "prompt-hero-body" : "prompt-card-body";
    body.textContent = prompt.body;
    card.appendChild(body);
  }

  if (prompt.meta) {
    const meta = document.createElement("p");
    meta.className = isHero ? "prompt-hero-meta" : "prompt-card-meta";
    meta.textContent = prompt.meta;
    card.appendChild(meta);
  }

  if (prompt.category === "music" || prompt.category === "artwork") {
    const link = document.createElement("a");
    link.className = isHero ? "prompt-hero-link" : "prompt-card-link";
    if (prompt.category === "music") {
      link.href = youtubeSearchUrl(`${prompt.title} ${prompt.meta}`);
      link.textContent = "Find it on YouTube ↗";
    } else {
      link.href = googleImagesSearchUrl(`${prompt.title} ${prompt.meta}`);
      link.textContent = "See the artwork ↗";
    }
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.appendChild(link);
  }

  if (isHero) {
    const date = document.createElement("p");
    date.className = "prompt-hero-date";
    date.textContent = formatPromptDate(dateKey);
    card.appendChild(date);
  }

  return card;
}

export function promptSummaryFor(dateKey) {
  const prompt = promptForDate(new Date(`${dateKey}T00:00:00`));
  const category = PROMPT_CATEGORIES[prompt.category];
  const headline = prompt.title || prompt.body;
  return { prompt, category, headline };
}

// Renders already-fetched entries (masonry) into `container`, wiring each
// card to open its read-only detail preview. Split from renderEntriesInto
// below so callers that already need the entry list for another decision
// (Home sizing its prompt hero vs. card) don't have to fetch it twice.
export async function renderEntryNodesInto(container, entries, refresh) {
  if (entries.length === 0) {
    container.className = "";
    container.replaceChildren();
    return;
  }
  const onOpen = (e) => openEntryDetail(e, { refresh });
  await renderDayEntries(container, entries, (entry) => createEntryNode(entry, onOpen), onOpen);
}

// Fetches and renders a day's entries (masonry) into `container`. Used by
// the Day Detail sheet, which doesn't need the list for anything else.
export async function renderEntriesInto(container, dateKey, refresh) {
  const entries = await getEntriesForDate(dateKey);
  await renderEntryNodesInto(container, entries, refresh);
  return entries;
}

export function addEntryForDate(dateKey, refresh) {
  const prompt = promptForDate(new Date(`${dateKey}T00:00:00`));
  openEntryEditor({ entry: createEmptyEntry(dateKey, prompt.id), isNew: true, refresh });
}

// Opens the full "day" view for any date that isn't today (today lives
// inline on Home) -- used from My Log and the Calendar. Shows the day's
// prompt, everything logged, a way to add more, and export/share.
export function openDayDetail(dateKey, { onChange } = {}) {
  const sheet = openSheet("tpl-day-detail");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  async function refresh() {
    const dayNumber = await getDayNumber(dateKey);
    el.querySelector("#day-detail-daynum").textContent = `Day ${dayNumber}`;
    el.querySelector("#day-detail-date").textContent = formatDate(dateKey);

    const promptSlot = el.querySelector("#day-detail-prompt-slot");
    promptSlot.replaceChildren(buildPromptCard(dateKey, { heading: "That day's creative prompt" }));

    const entriesEl = el.querySelector("#day-detail-entries");
    const entries = await renderEntriesInto(entriesEl, dateKey, refresh);

    const emptyEl = el.querySelector("#day-detail-empty");
    emptyEl.classList.toggle("hidden", entries.length > 0);

    const shareBtn = el.querySelector("#day-detail-share-btn");
    shareBtn.classList.toggle("hidden", entries.length === 0);

    if (onChange) onChange();
  }

  el.querySelector("#day-detail-add-btn").addEventListener("click", () => addEntryForDate(dateKey, refresh));
  el.querySelector("#day-detail-share-btn").addEventListener("click", () => openDayShareSheet(dateKey));

  refresh();
}

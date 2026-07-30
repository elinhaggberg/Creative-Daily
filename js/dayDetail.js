import { getEntriesForDate, getDayNumber, createEmptyEntry, todayKey } from "./storage.js";
import { promptForDate, getPrompt, PROMPT_CATEGORIES, youtubeSearchUrl } from "./prompts.js";
import { openSheet } from "./sheet.js";
import { openEntryEditor } from "./entryEditor.js";
import { createEntryNode } from "./entryCard.js";
import { renderDayEntries } from "./masonry.js";
import { formatPromptDate, formatDate } from "./util.js";
import { ICON_PLUS, ICON_SHARE } from "./icons.js";
import { openDayShareSheet } from "./dataManagement.js";

// Builds the "today's creative prompt" card -- shared by Home (today, always
// visible) and Day Detail (any past/future day, inside a sheet).
export function buildPromptCard(dateKey, { heading = "Today's creative prompt" } = {}) {
  const prompt = promptForDate(new Date(`${dateKey}T00:00:00`));
  const category = PROMPT_CATEGORIES[prompt.category];

  const card = document.createElement("div");
  card.className = "prompt-card";

  const head = document.createElement("div");
  head.className = "prompt-card-head";
  head.innerHTML = `<p class="prompt-card-heading">${heading}</p><p class="prompt-card-date">${formatPromptDate(dateKey)}</p>`;
  card.appendChild(head);

  const badge = document.createElement("span");
  badge.className = "prompt-card-badge";
  badge.textContent = category.label;
  card.appendChild(badge);

  const title = document.createElement("p");
  title.className = "prompt-card-title";
  title.textContent = prompt.title || prompt.body;
  card.appendChild(title);

  if (prompt.title && prompt.body) {
    const body = document.createElement("p");
    body.className = "prompt-card-body";
    body.textContent = prompt.body;
    card.appendChild(body);
  }

  if (prompt.meta) {
    const meta = document.createElement("p");
    meta.className = "prompt-card-meta";
    meta.textContent = prompt.meta;
    card.appendChild(meta);
  }

  if (prompt.category === "music") {
    const link = document.createElement("a");
    link.className = "prompt-card-link";
    link.href = youtubeSearchUrl(`${prompt.title} ${prompt.meta}`);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Find it on YouTube ↗";
    card.appendChild(link);
  }

  return card;
}

export function promptSummaryFor(dateKey) {
  const prompt = promptForDate(new Date(`${dateKey}T00:00:00`));
  const category = PROMPT_CATEGORIES[prompt.category];
  const headline = prompt.title || prompt.body;
  return { prompt, category, headline };
}

// Renders a day's entries (masonry) into `container`, wiring each card to
// open the editor. Shared by Home's inline "today" section and the Day
// Detail sheet.
export async function renderEntriesInto(container, dateKey, refresh) {
  const entries = await getEntriesForDate(dateKey);
  if (entries.length === 0) {
    container.className = "";
    container.replaceChildren();
    return entries;
  }
  renderDayEntries(container, entries, (entry) =>
    createEntryNode(entry, (e) => openEntryEditor({ entry: e, isNew: false, refresh }))
  );
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

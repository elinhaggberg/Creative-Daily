import { getAll, getOne, putOne, deleteOne } from "./db.js";

const THEME_KEY = "cd_theme_v1";
const LAST_SEEN_VERSION_KEY = "cd_last_seen_version_v1";
const LAST_BACKUP_KEY = "cd_last_backup_at_v1";
const BACKUP_BANNER_DISMISSED_KEY = "cd_backup_banner_dismissed_at_v1";
const FIRST_OPEN_KEY = "cd_first_open_at_v1";
const ONBOARDING_SEEN_KEY = "cd_onboarding_seen_v1";
const LOG_FILTER_KEY = "cd_log_filter_v1";

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Dates ----

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateKey, n) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

export function todayKey() {
  return toDateKey(new Date());
}

// ---- Entries ----

export function createEmptyEntry(dateKey, promptId) {
  return {
    id: uid(),
    dateKey,
    promptId,
    type: "note",
    text: "",
    images: [],
    url: "",
    audio: "",
    audioDuration: 0,
    createdAt: Date.now(),
  };
}

export async function getEntries() {
  return getAll("entries");
}

export async function getEntry(id) {
  return getOne("entries", id);
}

export async function saveEntry(entry) {
  const withTimestamp = { ...entry, updatedAt: Date.now() };
  await putOne("entries", withTimestamp);
  return withTimestamp;
}

export async function deleteEntry(id) {
  await deleteOne("entries", id);
}

export async function getEntriesForDate(dateKey) {
  const entries = await getEntries();
  return entries.filter((e) => e.dateKey === dateKey).sort((a, b) => a.createdAt - b.createdAt);
}

// Every calendar day that has at least one entry, most recent first — the
// backbone of both My Log's card grid and the Day counter below.
export async function getDaysWithEntries() {
  const entries = await getEntries();
  const byDate = new Map();
  for (const entry of entries) {
    if (!byDate.has(entry.dateKey)) byDate.set(entry.dateKey, []);
    byDate.get(entry.dateKey).push(entry);
  }
  return [...byDate.entries()]
    .map(([dateKey, dayEntries]) => ({ dateKey, entries: dayEntries.sort((a, b) => a.createdAt - b.createdAt) }))
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}

// "Day N" is a count of distinct creation-days, not a login streak — it
// never resets for skipping a day, it just waits. As of a given date: every
// distinct day that already has an entry counts, plus one more slot for the
// day currently in progress if that day doesn't have an entry yet. So a
// brand-new install with zero entries reads "Day 1" (today's slot, unfilled)
// and creating today's first entry keeps it at "Day 1" rather than jumping
// to 2 — the count only advances once a *new* day arrives still needing one.
export async function getDayNumber(asOfKey = todayKey()) {
  const days = await getDaysWithEntries();
  const distinctBefore = days.filter((d) => d.dateKey <= asOfKey).length;
  const hasEntryAsOf = days.some((d) => d.dateKey === asOfKey);
  return distinctBefore + (hasEntryAsOf ? 0 : 1);
}

// Past days since first open that have no entry at all — what the Calendar
// offers to "catch up" on.
export async function getMissedDateKeys() {
  const days = await getDaysWithEntries();
  const doneDates = new Set(days.map((d) => d.dateKey));
  const firstOpenKey = toDateKey(new Date(getFirstOpenAt()));
  const today = todayKey();
  const missed = [];
  let cursor = firstOpenKey;
  while (cursor < today) {
    if (!doneDates.has(cursor)) missed.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return missed;
}

// Rough total size (in bytes) of every image/audio data: URI currently
// stored — base64 runs ~4 bytes per 3 source bytes, close enough for a
// "here's about how much space this is using" estimate in the
// storage-management sheet. Voice recordings tend to be the biggest single
// offender, so they're counted right alongside photos.
export async function estimateImageBytes() {
  const entries = await getEntries();
  let total = 0;
  for (const entry of entries) {
    for (const img of entry.images || []) total += Math.floor((img.length * 3) / 4);
    if (entry.audio) total += Math.floor((entry.audio.length * 3) / 4);
  }
  return total;
}

// Strips the actual image/audio bytes from every entry dated within
// [fromKey, toKey] but keeps the entry itself (type, text, date, prompt)
// intact, so the day count and log history never lose a day just because
// its media was cleared out to save space. Safe to call repeatedly.
export async function clearImagesInRange(fromKey, toKey) {
  const entries = await getEntries();
  let cleared = 0;
  for (const entry of entries) {
    if (entry.dateKey < fromKey || entry.dateKey > toKey) continue;
    const hasImages = entry.images && entry.images.length > 0;
    const hasAudio = Boolean(entry.audio);
    if (!hasImages && !hasAudio) continue;
    await putOne("entries", { ...entry, images: [], audio: "", imagesCleared: true });
    cleared++;
  }
  return cleared;
}

// ---- Export / import ----

export async function exportBackupData() {
  return {
    type: "creative-daily-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: await getEntries(),
    theme: getThemePref(),
  };
}

export async function exportRangeData(fromKey, toKey) {
  const entries = (await getEntries()).filter((e) => e.dateKey >= fromKey && e.dateKey <= toKey);
  return {
    type: "creative-daily-collection",
    version: 1,
    exportedAt: new Date().toISOString(),
    from: fromKey,
    to: toKey,
    entries,
  };
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.dateKey)) return null;
  return {
    id: uid(),
    dateKey: raw.dateKey,
    promptId: typeof raw.promptId === "string" ? raw.promptId : null,
    type: typeof raw.type === "string" ? raw.type : "note",
    text: typeof raw.text === "string" ? raw.text : "",
    images: Array.isArray(raw.images) ? raw.images.filter((i) => typeof i === "string") : [],
    url: typeof raw.url === "string" ? raw.url : "",
    audio: typeof raw.audio === "string" ? raw.audio : "",
    audioDuration: typeof raw.audioDuration === "number" ? raw.audioDuration : 0,
    imagesCleared: raw.imagesCleared === true,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
}

// Always merges (adds as new entries) rather than replacing, so a bad or
// repeated import can never destroy what's already logged.
export async function importData(data) {
  if (!data || !["creative-daily-backup", "creative-daily-collection"].includes(data.type)) {
    throw new Error("That doesn't look like a Creative Daily export file.");
  }
  const incoming = Array.isArray(data.entries) ? data.entries : [];
  const sanitized = incoming.map(sanitizeEntry).filter(Boolean);
  for (const entry of sanitized) await putOne("entries", entry);

  if (data.type === "creative-daily-backup" && data.theme) setThemePref(data.theme);

  return { entryCount: sanitized.length };
}

// ---- Preferences ----

export function getThemePref() {
  return readJSON(THEME_KEY, {});
}

export function setThemePref(pref) {
  writeJSON(THEME_KEY, pref);
}

export function getLastSeenVersion() {
  return localStorage.getItem(LAST_SEEN_VERSION_KEY) || "";
}

export function setLastSeenVersion(version) {
  localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
}

function getFirstOpenAt() {
  let v = Number(localStorage.getItem(FIRST_OPEN_KEY));
  if (!v) {
    v = Date.now();
    localStorage.setItem(FIRST_OPEN_KEY, String(v));
  }
  return v;
}
export { getFirstOpenAt };

export function markBackedUp() {
  localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
  localStorage.removeItem(BACKUP_BANNER_DISMISSED_KEY);
}

export function dismissBackupBanner() {
  localStorage.setItem(BACKUP_BANNER_DISMISSED_KEY, String(Date.now()));
}

const BACKUP_REMIND_AFTER_MS = 14 * 24 * 60 * 60 * 1000;
const BACKUP_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

export async function shouldShowBackupBanner() {
  const entries = await getEntries();
  if (entries.length === 0) return false;

  const lastBackupAt = Number(localStorage.getItem(LAST_BACKUP_KEY)) || getFirstOpenAt();
  if (Date.now() - lastBackupAt < BACKUP_REMIND_AFTER_MS) return false;

  const dismissedAt = Number(localStorage.getItem(BACKUP_BANNER_DISMISSED_KEY));
  if (dismissedAt && Date.now() - dismissedAt < BACKUP_SNOOZE_MS) return false;

  return true;
}

const DEFAULT_LOG_FILTER = { types: [], dateFrom: "", dateTo: "" };

export function getLogFilterPref() {
  return { ...DEFAULT_LOG_FILTER, ...readJSON(LOG_FILTER_KEY, {}) };
}

export function setLogFilterPref(pref) {
  writeJSON(LOG_FILTER_KEY, pref);
}

export function getOnboardingSeen() {
  return localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
}

export function setOnboardingSeen() {
  localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
}

export { uid };

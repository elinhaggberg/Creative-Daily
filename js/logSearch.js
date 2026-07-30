import { getDaysWithEntries } from "./storage.js";
import { openSheet } from "./sheet.js";
import { createDayCardNode } from "./dayCard.js";
import { openDayDetail } from "./dayDetail.js";

export function openLogSearch(onOpenDay) {
  const sheet = openSheet("tpl-log-search");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  const input = el.querySelector("#log-search-input");
  const resultsEl = el.querySelector("#log-search-results");
  const emptyEl = el.querySelector("#log-search-empty");

  async function runSearch() {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      resultsEl.replaceChildren();
      emptyEl.textContent = "Start typing to search your log.";
      emptyEl.classList.remove("hidden");
      return;
    }
    const days = await getDaysWithEntries();
    const matches = days.filter((day) =>
      day.entries.some(
        (e) => (e.text || "").toLowerCase().includes(q) || (e.url || "").toLowerCase().includes(q)
      )
    );
    if (matches.length === 0) {
      resultsEl.replaceChildren();
      emptyEl.textContent = "Nothing in your log matches that search.";
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");
    resultsEl.replaceChildren(
      ...matches.map((day) =>
        createDayCardNode(day, (dateKey) => {
          openDayDetail(dateKey, { onChange: onOpenDay });
        })
      )
    );
  }

  input.addEventListener("input", runSearch);
  runSearch();
  setTimeout(() => input.focus(), 50);
}

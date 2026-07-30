import { getDaysWithEntries, getLogFilterPref, setLogFilterPref } from "../storage.js";
import { createDayCardNode } from "../dayCard.js";
import { openDayDetail } from "../dayDetail.js";
import { openSettingsMenu } from "../settingsMenu.js";
import { openLogSearch } from "../logSearch.js";
import { openLogFilterSheet, isLogFilterActive, applyLogFilter } from "../logFilter.js";
import { ENTRY_TYPES } from "../entryTypes.js";

export async function renderLog(root, nav) {
  const tpl = document.getElementById("tpl-log");
  root.replaceChildren(tpl.content.cloneNode(true));

  root.querySelector(".back-btn").addEventListener("click", () => nav.toHome());
  root.querySelector("#menu-btn").addEventListener("click", () => openSettingsMenu(refresh));
  root.querySelector("#search-btn").addEventListener("click", () => openLogSearch(refresh));
  root.querySelector("#filter-btn").addEventListener("click", () => openLogFilterSheet(refresh));

  const grid = root.querySelector("#log-grid");
  const headlineEl = root.querySelector("#log-headline");
  const clearBtn = root.querySelector("#log-filter-clear-btn");

  async function refresh() {
    const days = await getDaysWithEntries();
    const pref = getLogFilterPref();
    const filtered = isLogFilterActive(pref) ? applyLogFilter(days, pref) : days;

    if (isLogFilterActive(pref)) {
      const clauses = [];
      if (pref.types?.length) clauses.push(pref.types.map((t) => ENTRY_TYPES.find((e) => e.id === t)?.label || t).join(", "));
      if (pref.dateFrom || pref.dateTo) clauses.push([pref.dateFrom, pref.dateTo].filter(Boolean).join(" – "));
      headlineEl.textContent = clauses.join(" · ") || "Filtered";
      clearBtn.classList.remove("hidden");
    } else {
      headlineEl.textContent = "Your log";
      clearBtn.classList.add("hidden");
    }

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = days.length === 0
        ? "Nothing logged yet — head back to Home and capture today's piece."
        : "Nothing matches this filter.";
      grid.replaceChildren(empty);
      return;
    }

    grid.replaceChildren(
      ...filtered.map((day) =>
        createDayCardNode(day, (dateKey) => openDayDetail(dateKey, { onChange: refresh }))
      )
    );
  }

  clearBtn.addEventListener("click", () => {
    setLogFilterPref({ types: [], dateFrom: "", dateTo: "" });
    refresh();
  });

  refresh();
}

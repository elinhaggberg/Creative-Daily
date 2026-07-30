import { getLogFilterPref, setLogFilterPref } from "./storage.js";
import { openSheet } from "./sheet.js";
import { ENTRY_TYPES } from "./entryTypes.js";

export function isLogFilterActive(pref) {
  return Boolean(pref.types?.length || pref.dateFrom || pref.dateTo);
}

export function applyLogFilter(days, pref) {
  let list = days;
  if (pref.types?.length) {
    list = list.filter((day) => day.entries.some((e) => pref.types.includes(e.type)));
  }
  if (pref.dateFrom) list = list.filter((day) => day.dateKey >= pref.dateFrom);
  if (pref.dateTo) list = list.filter((day) => day.dateKey <= pref.dateTo);
  return list;
}

export async function openLogFilterSheet(onChange) {
  const sheet = openSheet("tpl-log-filter");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  const pref = getLogFilterPref();

  const typeRow = el.querySelector("#log-filter-type-row");
  function renderTypeRow() {
    typeRow.replaceChildren(
      ...ENTRY_TYPES.map((t) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "type-chip" + (pref.types.includes(t.id) ? " active" : "");
        chip.innerHTML = `${t.icon}<span>${t.label}</span>`;
        chip.addEventListener("click", () => {
          const idx = pref.types.indexOf(t.id);
          if (idx >= 0) pref.types.splice(idx, 1);
          else pref.types.push(t.id);
          setLogFilterPref(pref);
          renderTypeRow();
          onChange();
        });
        return chip;
      })
    );
  }
  renderTypeRow();

  const fromInput = el.querySelector("#log-filter-date-from");
  const toInput = el.querySelector("#log-filter-date-to");
  fromInput.value = pref.dateFrom || "";
  toInput.value = pref.dateTo || "";
  fromInput.addEventListener("change", () => {
    pref.dateFrom = fromInput.value;
    setLogFilterPref(pref);
    onChange();
  });
  toInput.addEventListener("change", () => {
    pref.dateTo = toInput.value;
    setLogFilterPref(pref);
    onChange();
  });

  el.querySelector("#log-filter-clear-btn").addEventListener("click", () => {
    setLogFilterPref({ types: [], dateFrom: "", dateTo: "" });
    sheet.close();
    onChange();
  });
}

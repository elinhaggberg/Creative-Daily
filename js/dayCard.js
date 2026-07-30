import { typeFor } from "./entryTypes.js";
import { formatDateShort } from "./util.js";

// One card in My Log's grid: the date, plus one icon per distinct type
// logged that day, plus a thumbnail if any entry has an image.
export function createDayCardNode(day, onOpen) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "day-card";

  const thumb = day.entries.find((e) => e.images && e.images[0]);
  if (thumb) {
    const img = document.createElement("img");
    img.className = "day-card-media";
    img.loading = "lazy";
    img.src = thumb.images[0];
    img.alt = "";
    button.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "day-card-body";

  const dateEl = document.createElement("p");
  dateEl.className = "day-card-date";
  dateEl.textContent = formatDateShort(day.dateKey);
  body.appendChild(dateEl);

  const types = [...new Set(day.entries.map((e) => e.type))];
  const iconRow = document.createElement("div");
  iconRow.className = "day-card-icons";
  iconRow.innerHTML = types.map((t) => `<span class="day-card-icon">${typeFor(t).icon}</span>`).join("");
  body.appendChild(iconRow);

  const countEl = document.createElement("p");
  countEl.className = "day-card-count";
  countEl.textContent = `${day.entries.length} piece${day.entries.length === 1 ? "" : "s"}`;
  body.appendChild(countEl);

  button.appendChild(body);
  button.addEventListener("click", () => onOpen(day.dateKey));
  return button;
}

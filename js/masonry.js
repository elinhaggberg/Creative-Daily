// Renders a day's entries the way the app describes itself: the first piece
// logged is a full-width card by itself; from the second piece on, cards
// bin-pack into two columns (always adding to whichever column is
// currently shorter), so it reads as real masonry rather than a rigid grid.
export function renderDayEntries(container, entries, createNode) {
  if (entries.length === 0) {
    container.replaceChildren();
    return;
  }
  if (entries.length === 1) {
    container.className = "entry-stack";
    container.replaceChildren(createNode(entries[0]));
    return;
  }

  container.className = "entry-columns";
  const columns = [document.createElement("div"), document.createElement("div")];
  columns.forEach((col) => (col.className = "entry-col"));
  container.replaceChildren(...columns);

  for (const entry of entries) {
    const shortest = columns[0].offsetHeight <= columns[1].offsetHeight ? 0 : 1;
    columns[shortest].appendChild(createNode(entry));
  }
}

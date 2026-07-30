// Renders a day's entries the way the app describes itself: the first piece
// logged is a full-width card by itself; from the second piece on, cards
// bin-pack into two columns (always adding to whichever column is
// currently shorter), so it reads as real masonry rather than a rigid grid.
export async function renderDayEntries(container, entries, createNode) {
  if (entries.length === 0) {
    container.className = "";
    container.replaceChildren();
    return;
  }

  const nodes = entries.map((entry) => createNode(entry));

  // The bin-packing below decides where a card goes by reading the real
  // rendered height of each column right after appending it -- which only
  // works if any <img> inside is already decoded. A data: URI still takes a
  // moment to decode off the main thread, so a card with a not-yet-decoded
  // photo briefly measures as ~0px tall; everything placed after it in that
  // instant skews onto the wrong column once the photo actually paints in,
  // stacking the rest of the day lopsidedly into one side. Decoding every
  // image up front (off-DOM, so this doesn't block first paint of anything
  // else) means every card already has its final height the moment it's
  // measured.
  await Promise.all(
    nodes.flatMap((node) =>
      Array.from(node.querySelectorAll("img")).map((img) => (img.decode ? img.decode().catch(() => {}) : null))
    )
  );

  if (nodes.length === 1) {
    container.className = "entry-stack";
    container.replaceChildren(nodes[0]);
    return;
  }

  container.className = "entry-columns";
  const columns = [document.createElement("div"), document.createElement("div")];
  columns.forEach((col) => (col.className = "entry-col"));
  container.replaceChildren(...columns);

  for (const node of nodes) {
    const shortest = columns[0].offsetHeight <= columns[1].offsetHeight ? 0 : 1;
    columns[shortest].appendChild(node);
  }
}

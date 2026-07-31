import { buildFallbackCard } from "./entryCard.js";

// A hung decode (a truly huge image, or a browser that never settles the
// promise for some data: URIs) must not be able to block the whole day's
// render forever -- better to place a card by its best-known height than to
// never place it at all.
const DECODE_TIMEOUT_MS = 4000;

// Every navigation (Home <-> My Log <-> Calendar, or just reopening a day)
// rebuilds that view's DOM from scratch, including brand-new <img> elements
// for photos that were already decoded a moment ago -- without remembering
// that, the same gallery pays the same decode wait every single time you
// look at it, not just the first. Data: URIs are stable strings, so a
// module-level cache of "this exact source has decoded successfully
// before" (kept for the page's lifetime, not persisted) is a safe way to
// skip straight to painting on every visit after the first.
const decodedSrcCache = new Set();

function decodeWithTimeout(img) {
  if (!img.decode) return Promise.resolve();
  if (decodedSrcCache.has(img.src)) return Promise.resolve();
  return Promise.race([
    img.decode().then(() => decodedSrcCache.add(img.src)).catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, DECODE_TIMEOUT_MS)),
  ]);
}

// Only shown if building/decoding takes a moment -- e.g. several full-size
// gallery photos decoding on a slower device -- so a normal, fast, no-photo
// day never flashes a spinner it didn't need. Without this, that gap reads
// as "did my piece just disappear?" instead of "it's loading."
const LOADING_INDICATOR_DELAY_MS = 200;

function buildLoadingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "entry-loading";
  wrap.innerHTML = `<span class="entry-loading-spinner"></span><span>Loading…</span>`;
  return wrap;
}

// Renders a day's entries the way the app describes itself: the first piece
// logged is a full-width card by itself; from the second piece on, cards
// bin-pack into two columns (always adding to whichever column is
// currently shorter), so it reads as real masonry rather than a rigid grid.
// `onOpen`, if given, makes a fallback (broken-entry) card tappable too --
// its own detail sheet is hardened to still offer Delete even when it can't
// render the piece either, which is the only real way to recover from a
// genuinely corrupted entry.
export async function renderDayEntries(container, entries, createNode, onOpen) {
  if (entries.length === 0) {
    container.className = "";
    container.replaceChildren();
    return;
  }

  const loadingTimer = setTimeout(() => {
    container.className = "";
    container.replaceChildren(buildLoadingIndicator());
  }, LOADING_INDICATOR_DELAY_MS);

  // One malformed/corrupted entry throwing here used to take the entire
  // day's list down with it -- every card was built in a single .map(), so
  // one exception meant none of them ever rendered (and since the bad entry
  // stays in storage, the same crash repeated on every reload). Isolate
  // each card's build so a broken piece becomes one broken-looking card
  // instead of silently erasing every piece logged that day.
  const nodes = entries.map((entry) => {
    try {
      return createNode(entry);
    } catch (err) {
      console.error("Failed to render entry", entry?.id, err);
      const card = buildFallbackCard(entry);
      if (onOpen) card.addEventListener("click", () => onOpen(entry));
      return card;
    }
  });

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
  await Promise.all(nodes.flatMap((node) => Array.from(node.querySelectorAll("img")).map(decodeWithTimeout)));
  clearTimeout(loadingTimer);

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

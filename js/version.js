// Bump APP_VERSION and add a CHANGELOG entry with every user-visible
// release — whatsNew.js compares this against what a returning visitor last
// saw. Keep the version string in YYYY.MM.DD form (zero-padded) so plain
// string comparison sorts the same as chronological order.
export const APP_VERSION = "2026.07.31";

export const CHANGELOG = [
  {
    version: "2026.07.31",
    date: "July 31, 2026",
    changes: [
      "Added an App Library link in the gear menu, pointing to the Make it Local App Library of sibling apps.",
      "Fixed a bug where one broken piece could wipe an entire day from view: adding a piece with unexpected data could make every piece logged that day (not just the new one) silently vanish, and stay gone even after reloading, since the same bad data reloaded every time. A broken piece is now isolated to its own \"couldn't display this piece\" card, with everything else logged that day rendering normally, and Delete still works on it so it's recoverable.",
    ],
  },
  {
    version: "2026.07.30",
    date: "July 30, 2026",
    changes: [
      "Creative Daily launches: a daily creativity prompt, a beautiful capture form for whatever you make, and a log to look back through.",
      "Added Voice memo as a seventh way to capture a piece — record right in the app.",
      "Before you've logged anything, today's prompt now stands alone, centered and unboxed — it settles into the usual card once you add your first piece.",
      "Fixed voice memos disappearing from Share/PDF/PNG exports: since neither format can play audio, the recording now rides along as an actual separate file instead of just a note saying it's missing.",
      "New app icon.",
      "Tapping a piece now opens a preview first, with share/edit/delete up top, instead of jumping straight into editing it.",
      "Poem and Short story now open as a full-screen writing view instead of a compact card.",
      "Artwork prompts now link to a Google Images search, so you can actually look at the piece.",
      "Fixed a masonry layout bug where a photo card's height wasn't measured until after it fully loaded, sometimes stacking every following piece into one lopsided column.",
      "Fixed the entry preview collapsing to almost nothing for short pieces, and tightened up spacing in the capture form.",
      "A single piece now has its own Share menu — image, PDF, or JSON — same as a full day.",
      "Redesigned image export: each piece now renders as its own shareable card (1080×1350, Instagram-portrait size) instead of one long stitched screenshot. A day with more than one piece opens a picker to choose which cards to keep, one PNG per piece.",
      "Fixed Save as PDF silently doing nothing on some browsers: it was fetching data after the tap instead of before, and once that gap crossed into real async work, iOS Safari quietly refused to open the print dialog. All PDF exports now prefetch first so printing happens the instant you tap.",
      "Fixed text overlapping and layout jumping around on longer sheets (like Export & manage data): the sheet no longer uses flex layout at all (it never needed to), which was letting content get squeezed shorter than it needed before scrolling kicked in.",
      "Fixed a second, separate cause of the same page shifting under your finger: the storage-used line started blank and only got its real text once a background read of your stored photos finished, silently pushing everything below it down mid-scroll. It now reserves its place immediately.",
      "Fixed the real cause of Export & manage data feeling draggable in every direction: the From/To date row could render wider than the sheet on iOS, which quietly made the whole sheet horizontally scrollable too, so a normal vertical scroll gesture could drag the content sideways as well as up and down.",
      "Fixed date fields (Export & manage data, and the Log filter) still overflowing their box on iOS after that: a native date picker doesn't reliably shrink to a percentage width there, so each one is now held to an exact size instead of being left to size itself.",
      "Grew the daily prompt library from 52 to 170 (a bit over 5.5 months before any prompt repeats, up from under 2). Also diversified it well beyond the original mostly-Western, mostly-male, mostly-somber default, and fixed two artwork entries that had quietly violated the app's own public-domain rule.",
      "Grew the prompt library again, 170 to 365 — a full year before any prompt repeats. Filled in more of art history (Renaissance and Baroque masters, more women painters long left out of the story) alongside further reach into Khmer, Korean, Ethiopian, Andean, Persian, and Mughal artwork; Russian, French, Spanish, Chinese, and Arabic literature in public-domain translation; and Cuban, Brazilian, Jamaican, American blues/jazz, and Balkan music.",
      "New in the menu: Guides — seven short starter guides (a daily creative practice, drawing, poetry, short stories, photography, film, and mixed media) for when a practice feels tempting but hard to start. Each one distills the field's conventional wisdom, ends with a start-today assignment, and links a few widely loved books and channels.",
      "Redesigned the image share card: the daily prompt is now a small \"Today's prompt\" line at the top instead of a big headline, so the piece you actually made gets the card.",
      "Tweaked the share card again: the prompt line is now centered at the top, and the Day number and date moved down to the footer, replacing the piece-type label that used to sit there.",
      "Mentioned Guides in the \"How this app works\" popup and the full Instructions, so it's discoverable from day one instead of only by browsing the menu.",
      "On the share card, the prompt type now sits on its own line above the headline instead of crowding in beside it.",
    ],
  },
];

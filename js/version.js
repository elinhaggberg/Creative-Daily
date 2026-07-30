// Bump APP_VERSION and add a CHANGELOG entry with every user-visible
// release — whatsNew.js compares this against what a returning visitor last
// saw. Keep the version string in YYYY.MM.DD form (zero-padded) so plain
// string comparison sorts the same as chronological order.
export const APP_VERSION = "2026.07.30";

export const CHANGELOG = [
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
    ],
  },
];

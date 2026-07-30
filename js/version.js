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
    ],
  },
];

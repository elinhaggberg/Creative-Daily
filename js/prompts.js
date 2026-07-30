// The daily prompt bank. Five categories mixed together (word / artwork /
// subject / text / music) so the rotation doesn't run through a whole block
// of one kind before moving to the next — same "interleave by category, then
// rotate deterministically off the date" trick Work It Daily uses for its
// exercise pool, just with a fixed (non-recency-avoiding) sequence since
// there's no "muscle group" reason to skip a repeat category two days apart.
//
// "Artwork" and "text" entries deliberately only cite real, public-domain
// works (pre-1900 poetry/prose, art history's greatest hits) rather than
// anything still in copyright — this app ships the citation as plain text
// bundled with the source code. "Music" entries name a real classical piece
// and build a YouTube *search* link at render time (never a hardcoded video
// URL, which would eventually 404 or point at the wrong upload).

export const PROMPT_CATEGORIES = {
  word: { label: "A word", blurb: "One word. Take it wherever it leads." },
  subject: { label: "A subject", blurb: "A theme to explore, in whatever medium you like." },
  artwork: { label: "A famous artwork", blurb: "Respond to it, riff on it, or borrow its mood." },
  text: { label: "A piece of text", blurb: "A line worth sitting with." },
  music: { label: "A piece of music", blurb: "Listen first, then make something." },
};

const WORDS = [
  "Threshold", "Unravel", "Bloom", "Static", "Tender", "Wildfire", "Hollow",
  "Glimmer", "Undone", "Anchor", "Feral", "Echo",
];

const SUBJECTS = [
  "A room no one has entered in years",
  "The last text message you'd want to receive",
  "Something small that got left behind",
  "A conversation between two strangers on a train",
  "The sound of a house settling at night",
  "What your hands remember",
  "A map of somewhere that doesn't exist",
  "The moment right before saying yes",
  "Something borrowed and never returned",
  "A season changing its mind",
];

const ARTWORKS = [
  { title: "The Starry Night", meta: "Vincent van Gogh, 1889", body: "A swirling night sky over a sleeping village." },
  { title: "The Great Wave off Kanagawa", meta: "Katsushika Hokusai, c. 1831", body: "A towering wave dwarfing three boats, Mount Fuji small in the distance." },
  { title: "Girl with a Pearl Earring", meta: "Johannes Vermeer, c. 1665", body: "A girl glancing over her shoulder, caught mid-thought." },
  { title: "The Persistence of Memory", meta: "Salvador Dalí, 1931", body: "Melting clocks draped over a dreamlike landscape." },
  { title: "Water Lilies", meta: "Claude Monet, c. 1915–1926", body: "A pond dissolving into color and reflection." },
  { title: "The Scream", meta: "Edvard Munch, 1893", body: "A figure on a bridge, the sky itself seeming to cry out." },
  { title: "American Gothic", meta: "Grant Wood, 1930", body: "A farmer and his daughter standing stern before their house." },
  { title: "Composition VIII", meta: "Wassily Kandinsky, 1923", body: "Circles, lines, and triangles in restless conversation." },
  { title: "The Birth of Venus", meta: "Sandro Botticelli, c. 1485", body: "A goddess arriving on a shell, entirely unhurried." },
  { title: "Nighthawks", meta: "Edward Hopper, 1942", body: "Three strangers and a bartender, lit up alone at 3am." },
];

const TEXTS = [
  { body: "Hope is the thing with feathers— / That perches in the soul—", meta: "Emily Dickinson" },
  { body: "I celebrate myself, and sing myself,", meta: "Walt Whitman, “Song of Myself”" },
  { body: "Tyger Tyger, burning bright, / In the forests of the night;", meta: "William Blake, “The Tyger”" },
  { body: "To be, or not to be, that is the question—", meta: "William Shakespeare, Hamlet" },
  { body: "The woods are lovely, dark and deep, / But I have promises to keep,", meta: "Robert Frost, “Stopping by Woods on a Snowy Evening”" },
  { body: "It was the best of times, it was the worst of times,", meta: "Charles Dickens, A Tale of Two Cities" },
  { body: "I wandered lonely as a cloud", meta: "William Wordsworth" },
  { body: "Out of the night that covers me, / Black as the pit from pole to pole,", meta: "William Ernest Henley, “Invictus”" },
  { body: "Water, water, every where, / Nor any drop to drink.", meta: "Samuel Taylor Coleridge, “The Rime of the Ancient Mariner”" },
  { body: "All the world's a stage, / And all the men and women merely players;", meta: "William Shakespeare, As You Like It" },
];

const MUSIC = [
  { title: "Clair de Lune", meta: "Claude Debussy" },
  { title: "Moonlight Sonata, 1st movement", meta: "Ludwig van Beethoven" },
  { title: "Gymnopédie No. 1", meta: "Erik Satie" },
  { title: "The Four Seasons: Winter", meta: "Antonio Vivaldi" },
  { title: "Prelude in C Major, BWV 846", meta: "Johann Sebastian Bach" },
  { title: "Swan Lake: Scene", meta: "Pyotr Ilyich Tchaikovsky" },
  { title: "Nocturne in E-flat Major, Op. 9 No. 2", meta: "Frédéric Chopin" },
  { title: "Canon in D", meta: "Johann Pachelbel" },
  { title: "The Planets: Mars, the Bringer of War", meta: "Gustav Holst" },
  { title: "Ave Maria", meta: "Franz Schubert" },
];

function buildPool() {
  const pool = [
    ...WORDS.map((w, i) => ({ id: `word-${i}`, category: "word", title: w, body: "", meta: "" })),
    ...SUBJECTS.map((s, i) => ({ id: `subject-${i}`, category: "subject", title: s, body: "", meta: "" })),
    ...ARTWORKS.map((a, i) => ({ id: `artwork-${i}`, category: "artwork", title: a.title, body: a.body, meta: a.meta })),
    ...TEXTS.map((t, i) => ({ id: `text-${i}`, category: "text", title: "", body: t.body, meta: t.meta })),
    ...MUSIC.map((m, i) => ({ id: `music-${i}`, category: "music", title: m.title, body: "", meta: m.meta })),
  ];

  const byCategory = new Map();
  for (const p of pool) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
  }
  const buckets = [...byCategory.values()];
  const maxLen = Math.max(...buckets.map((b) => b.length));
  const interleaved = [];
  for (let i = 0; i < maxLen; i++) {
    for (const bucket of buckets) if (bucket[i]) interleaved.push(bucket[i]);
  }
  return interleaved;
}

const PROMPT_POOL = buildPool();

// The date the rotation starts counting from — arbitrary, just fixed forever
// so today's prompt is stable across reloads and devices without a server.
const ROTATION_START = "2026-07-30";

function dayIndex(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function promptForDate(date) {
  const startIdx = dayIndex(new Date(`${ROTATION_START}T00:00:00`));
  const offset = dayIndex(date) - startIdx;
  const idx = ((offset % PROMPT_POOL.length) + PROMPT_POOL.length) % PROMPT_POOL.length;
  return PROMPT_POOL[idx];
}

export function getPrompt(id) {
  return PROMPT_POOL.find((p) => p.id === id) || null;
}

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

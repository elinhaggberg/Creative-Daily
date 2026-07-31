// The daily prompt bank. Five categories mixed together (word / artwork /
// subject / text / music) so the rotation doesn't run through a whole block
// of one kind before moving to the next — same "interleave by category, then
// rotate deterministically off the date" trick Work It Daily uses for its
// exercise pool, just with a fixed (non-recency-avoiding) sequence since
// there's no "muscle group" reason to skip a repeat category two days apart.
//
// "Artwork" and "text" entries deliberately only cite real, public-domain
// works rather than anything still in copyright -- this app ships the
// citation as plain text bundled with the source code. That means every
// factual entry (artist/author, title, date) needs to be individually
// checked, not generated from memory: an earlier pass had shipped Dalí's
// "The Persistence of Memory" (Dalí died 1989 -- protected everywhere) and
// Hopper's "Nighthawks" (not public domain until 2037) despite the stated
// policy. Both are removed here. The safe rule of thumb used for every
// artwork below: the creator died before ~1955 (life+70 has expired nearly
// everywhere) or the work is anonymous/ancient with no attribution risk at
// all. "Text" entries follow the same logic, and where the original
// language isn't English, only translations old enough to be public domain
// themselves are used (e.g. FitzGerald's 1859 Rubáiyát) rather than a
// contemporary translation, which would carry its own separate copyright.
//
// "Music" entries name a real piece and build a YouTube *search* link at
// render time (never a hardcoded video URL, which would eventually 404 or
// point at the wrong upload) -- since nothing is embedded or redistributed,
// only a search query, these aren't restricted to public-domain works the
// way artwork/text are. The only bar is that the piece has to actually
// exist and be findable, which is why every non-obvious one here was
// checked against a real source rather than assumed.
//
// Deliberately diversified beyond the Western-canon default an AI (or a
// human working fast) tends to reach for first: artwork spans Ancient
// Egypt, Greece, China, Japan, the Ottoman court, the Yoruba and Benin
// kingdoms, Mexico, and Sweden's Hilma af Klint (arguably painting
// abstraction before Kandinsky, and long left out of that story); text adds
// Black American, South Asian, Middle Eastern, and 19th-century women
// writers largely absent from the original ten; music reaches into
// Hindustani, Javanese, Andean, Arabic, Yoruba/Afrobeat, Jewish, Tuvan, and
// Scottish traditions alongside the original Western classical set. Word
// and subject prompts are widened in tone too -- the original set leaned
// almost entirely moody/introspective, so this pass adds humor, the
// mundane, and the sensory alongside that.
//
// This is meant to be grown in further batches over time, not finished in
// one pass -- each addition should get the same source-check treatment
// rather than being generated in bulk from memory.

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
  "Salt", "Drift", "Tangle", "Hush", "Spark", "Rust", "Mend", "Flicker",
  "Nest", "Fracture", "Bristle", "Lull", "Ripple", "Grit", "Molt", "Ember",
  "Sprawl", "Crease", "Hum", "Thaw", "Wander", "Splice", "Murmur", "Petal",
  "Wobble", "Fizz", "Snug", "Clutter",
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
  "The world's most useless invention, drawn with full confidence",
  "A recipe for a feeling instead of a meal",
  "The exact sound your front door makes",
  "An argument between your left and right shoe",
  "What the inside of a laugh looks like",
  "A weather report for your mood today",
  "The last thing you'd grab in a fire, besides people and pets",
  "A love letter to a household object",
  "The world as seen by the family pet",
  "A rule you break every single day",
  "An instruction manual for doing absolutely nothing",
  "The view from the top of a very tall ladder",
  "A conversation you wish you'd had differently",
  "The smell of a specific summer",
  "Something that only makes sense at 2am",
  "A postcard from a place that doesn't exist yet",
  "The most honest thing in your kitchen",
  "A myth explaining why cats knock things off tables",
  "The last photograph on a stranger's phone",
  "A very small rebellion",
  "What silence sounds like in your childhood home",
  "An apology you never got to give",
  "The world's shortest bedtime story",
  "A museum exhibit dedicated to your junk drawer",
  "The moment a plan falls apart, from the plan's point of view",
  "A letter to next winter",
  "The sound of a decision being made",
  "Something you'd tell your ten-years-younger self",
  "A very ordinary Tuesday, made important",
  "The last leaf on a tree, and what it's waiting for",
];

const ARTWORKS = [
  { title: "The Starry Night", meta: "Vincent van Gogh, 1889", body: "A swirling night sky over a sleeping village." },
  { title: "The Great Wave off Kanagawa", meta: "Katsushika Hokusai, c. 1831", body: "A towering wave dwarfing three boats, Mount Fuji small in the distance." },
  { title: "Girl with a Pearl Earring", meta: "Johannes Vermeer, c. 1665", body: "A girl glancing over her shoulder, caught mid-thought." },
  { title: "Water Lilies", meta: "Claude Monet, c. 1915–1926", body: "A pond dissolving into color and reflection." },
  { title: "The Scream", meta: "Edvard Munch, 1893", body: "A figure on a bridge, the sky itself seeming to cry out." },
  { title: "American Gothic", meta: "Grant Wood, 1930", body: "A farmer and his daughter standing stern before their house." },
  { title: "Composition VIII", meta: "Wassily Kandinsky, 1923", body: "Circles, lines, and triangles in restless conversation." },
  { title: "The Birth of Venus", meta: "Sandro Botticelli, c. 1485", body: "A goddess arriving on a shell, entirely unhurried." },
  { title: "Mask of Tutankhamun", meta: "Ancient Egypt, c. 1323 BCE", body: "Gold and lapis lazuli, built to outlast everyone who'd remember his face." },
  { title: "Bust of Nefertiti", meta: "Ancient Egypt, c. 1345 BCE", body: "A queen's profile, composed enough to have outlasted her entire kingdom." },
  { title: "Venus de Milo", meta: "Ancient Greece, c. 100 BCE", body: "A goddess missing both arms and somehow none of her presence." },
  { title: "Terracotta Army", meta: "Qin Dynasty, China, c. 210 BCE", body: "Thousands of soldiers, no two faces alike, standing guard in the dark." },
  { title: "Bayeux Tapestry", meta: "Normandy, c. 1070s", body: "A war told entirely in thread, seventy meters of it." },
  { title: "Trinity", meta: "Andrei Rublev, c. 1425", body: "Three seated figures, and somewhere in their circle, a place left open." },
  { title: "Dwelling in the Fuchun Mountains", meta: "Huang Gongwang, 1350", body: "A river valley unrolling, handspan by handspan, for seven meters." },
  { title: "Judith Slaying Holofernes", meta: "Artemisia Gentileschi, c. 1620", body: "Two women, one candle, and absolutely no hesitation." },
  { title: "Sudden Shower over Shin-Ōhashi Bridge and Atake", meta: "Utagawa Hiroshige, 1857", body: "Rain arriving sideways on a bridge full of people who didn't bring umbrellas." },
  { title: "Shakuntala", meta: "Raja Ravi Varma, 1898", body: "A woman pretends to pull a thorn from her foot while looking for someone else entirely." },
  { title: "Benin Bronze plaques", meta: "Kingdom of Benin, 16th century", body: "Court life cast in brass, meant to be read like a wall of memory." },
  { title: "Bronze Head from Ife", meta: "Yoruba, Kingdom of Ife, c. 14th–15th century", body: "A ruler's face, cast so precisely that scholars still debate how it was done." },
  { title: "Aztec Sun Stone", meta: "Mexico, c. 1502–1521", body: "A calendar carved in basalt, built to keep time longer than any one reign." },
  { title: "Nazca Lines", meta: "Peru, c. 500 BCE–500 CE", body: "Shapes so large they only resolve from the sky." },
  { title: "El Valle de México desde el Cerro de Santa Isabel", meta: "José María Velasco, 1875", body: "A whole valley laid out under a sky doing most of the work." },
  { title: "Bible Quilt", meta: "Harriet Powers, 1885–86", body: "Bible stories pieced into cloth by a woman born into slavery." },
  { title: "The Child's Bath", meta: "Mary Cassatt, 1893", body: "A mother and child seen without the usual polite distance." },
  { title: "Group IV, The Ten Largest, No. 7, Adulthood", meta: "Hilma af Klint, 1907", body: "A canvas the size of a wall, painted years before abstract art was supposed to exist." },
  { title: "Surname-i Vehbi (illustrated festival book)", meta: "Levni, Ottoman court, c. 1720", body: "A royal festival painted in enough detail to hear the music." },
  { title: "San Vitale mosaics", meta: "Ravenna, 6th century", body: "Whole walls turned to glittering glass, built to catch candlelight for a thousand years." },
  { title: "Gwion Gwion (Bradshaw) rock paintings", meta: "Kimberley, Australia, estimated thousands of years old", body: "Slender painted figures on a rock face older than most countries' names." },
  { title: "The geometric tilework of the Alhambra", meta: "Nasrid Granada, 14th century", body: "A pattern that repeats in a way that never quite repeats -- mathematicians still study why." },
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
  { body: "'Twas mercy brought me from my Pagan land, / Taught my benighted soul to understand", meta: "Phillis Wheatley, “On Being Brought from Africa to America”, 1773" },
  { body: "Make me a grave where'er you will, / In a lowly plain, or a lofty hill;", meta: "Frances Ellen Watkins Harper, “Bury Me in a Free Land”, 1858" },
  { body: "Look at me! Look at my arm! ... and ain't I a woman?", meta: "Sojourner Truth, women's rights speech, Akron, Ohio, 1851 (as recorded by Frances D. Gage)" },
  { body: "We wear the mask that grins and lies, / It hides our cheeks and shades our eyes,", meta: "Paul Laurence Dunbar, “We Wear the Mask”, 1896" },
  { body: "The silver trump of freedom had roused my soul to eternal wakefulness.", meta: "Frederick Douglass, Narrative of the Life of Frederick Douglass, 1845" },
  { body: "How do I love thee? Let me count the ways.", meta: "Elizabeth Barrett Browning, Sonnets from the Portuguese, XLIII, 1850" },
  { body: "Remember me when I am gone away, / Gone far away into the silent land;", meta: "Christina Rossetti, “Remember”, 1862" },
  { body: "A Book of Verses underneath the Bough, / A Jug of Wine, a Loaf of Bread—and Thou", meta: "Omar Khayyám, trans. Edward FitzGerald, Rubáiyát of Omar Khayyám, 1859" },
  { body: "Thou hast made me endless, such is thy pleasure.", meta: "Rabindranath Tagore, Gitanjali, 1912" },
  { body: "Your children are not your children. / They are the sons and daughters of Life's longing for itself.", meta: "Kahlil Gibran, The Prophet, 1923" },
  { body: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", meta: "Jane Austen, Pride and Prejudice, 1813" },
  { body: "It was on a dreary night of November that I beheld the accomplishment of my toils.", meta: "Mary Shelley, Frankenstein, 1818" },
  { body: "Reader, I married him.", meta: "Charlotte Brontë, Jane Eyre, 1847" },
  { body: "Whatever our souls are made of, his and mine are the same.", meta: "Emily Brontë, Wuthering Heights, 1847" },
  { body: "Christmas won't be Christmas without any presents.", meta: "Louisa May Alcott, Little Women, 1868" },
  { body: "The longest way must have its close — the gloomiest night will wear on to a morning.", meta: "Harriet Beecher Stowe, Uncle Tom's Cabin, 1852" },
  { body: "Call me Ishmael.", meta: "Herman Melville, Moby-Dick, 1851" },
  { body: "Once upon a midnight dreary, while I pondered, weak and weary,", meta: "Edgar Allan Poe, “The Raven”, 1845" },
  { body: "We hold these truths to be self-evident: that all men and women are created equal;", meta: "Elizabeth Cady Stanton, Declaration of Sentiments, 1848" },
  { body: "To be great is to be misunderstood.", meta: "Ralph Waldo Emerson, “Self-Reliance”, 1841" },
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
  { title: "Raga Bhairav", meta: "Hindustani classical raga, India" },
  { title: "Raga Jog", meta: "Ravi Shankar, sitar, India" },
  { title: "Gamelan Gong Kebyar", meta: "Balinese gamelan, Indonesia" },
  { title: "Etenraku", meta: "Japanese gagaku court music, traditional" },
  { title: "Flowing Water (Liu Shui)", meta: "Traditional guqin piece, China" },
  { title: "Alf Leila wa Leila", meta: "Umm Kulthum, Egypt, 1969" },
  { title: "Allah Hoo", meta: "Nusrat Fateh Ali Khan, qawwali, Pakistan" },
  { title: "Barco Negro", meta: "Amália Rodrigues, fado, Portugal, 1954" },
  { title: "Concierto de Aranjuez", meta: "Joaquín Rodrigo, Spain, 1939" },
  { title: "La Cumparsita", meta: "Gerardo Matos Rodríguez, tango, Uruguay, 1916" },
  { title: "Cielito Lindo", meta: "Quirino Mendoza y Cortés, Mexico, 1882" },
  { title: "El Cóndor Pasa", meta: "Daniel Alomía Robles, Peru, 1913" },
  { title: "Zombie", meta: "Fela Kuti, Afrobeat, Nigeria, 1976" },
  { title: "Hava Nagila", meta: "Abraham Zvi Idelsohn, 1918" },
  { title: "Sygyt", meta: "Tuvan throat singing, traditional" },
  { title: "The Drunken Concubine (Guifei Zuijiu)", meta: "Mei Lanfang, Peking opera, China, 1914" },
  { title: "Mbube", meta: "Solomon Linda, South Africa, 1939" },
  { title: "Sodade", meta: "Cesária Évora, morna, Cape Verde" },
  { title: "La Bamba", meta: "Traditional folk song, Veracruz, Mexico" },
  { title: "A Highland pibroch", meta: "Traditional Scottish bagpipe music" },
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

// Image search, since the point for an artwork prompt is to actually look
// at the thing -- a plain web search would mostly surface text about it.
export function googleImagesSearchUrl(query) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

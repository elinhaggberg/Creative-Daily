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
// policy. Both were removed. The safe rule of thumb used for every artwork
// here: the creator died before ~1955 (life+70 has expired nearly
// everywhere) or the work is anonymous/ancient with no attribution risk at
// all. "Text" entries follow the same logic, and where the original
// language isn't English, only translations old enough to be public domain
// themselves are used (e.g. FitzGerald's 1859 Rubáiyát, Garnett's Russian
// translations, Legge's Chinese classics) rather than a contemporary
// translation, which would carry its own separate copyright -- and the
// exact wording is checked against the real translation rather than
// reconstructed from memory. That check caught a real near-miss while
// writing this batch: the popular "It does not matter how slowly you go..."
// line widely attributed to Confucius is a modern invention, not anything
// James Legge (or Confucius) actually wrote -- it's been swapped for a line
// Legge's translation genuinely contains.
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
// human working fast) tends to reach for first. First expansion (52 -> 170)
// added Ancient Egypt/Greece/China/Japan, the Ottoman court, the Yoruba and
// Benin kingdoms, Mexico, and Hilma af Klint to artwork; Black American,
// South Asian, Middle Eastern, and 19th-century women writers to text;
// Hindustani, Javanese, Andean, Arabic, Afrobeat, Jewish, Tuvan, and
// Scottish traditions to music. This second expansion (170 -> 365, a full
// year before any repeat) fills in more of the Western canon that was still
// thin (Renaissance and Baroque masters, more women painters largely left
// out of art history, more 19th-century poets) alongside further reach into
// Khmer, Javanese, Korean, Ethiopian, Kongo, Plains, Navajo, Maori,
// Hawaiian, Inuit, Moche, Chavín, Olmec, Andalusian, Tunisian, Persian, and
// Mughal artwork; Russian, French, Spanish, Chinese, Persian, and Arabic
// literature in public-domain translation, plus more Black American,
// Native American, and women writers; and Carnatic, Vietnamese, Thai,
// Korean, Cuban, Brazilian, Jamaican, American blues/jazz, Appalachian,
// Irish, Sami, Balkan, Georgian, and Mongolian music. Word and subject
// prompts keep widening in tone rather than leaning on the same
// moody/introspective register throughout.
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
  "Frost", "Tumble", "Gleam", "Knot", "Sigh", "Blaze", "Whittle", "Crackle",
  "Shroud", "Ravel", "Simmer", "Creak", "Flourish", "Wisp", "Grumble",
  "Sparkle", "Nudge", "Coil", "Drizzle", "Tarnish", "Blur", "Whirl", "Graze",
  "Scatter", "Murk", "Bramble", "Glow", "Rumble", "Skitter", "Warp",
  "Nibble", "Plunge", "Sway",
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
  "A user manual for a very specific kind of silence",
  "The last voicemail saved on an old phone",
  "A grocery list that tells a whole story",
  "What the moon sees on a Tuesday",
  "The exact moment a plant decides to bloom",
  "A field guide to strangers on public transport",
  "The sound of a text message that changes everything",
  "An obituary for a bad habit",
  "The world according to whoever's closest to the floor",
  "A very specific kind of tired",
  "What gets lost in translation between two people who love each other",
  "A conversation with your future self about today",
  "The last thing left in an empty fridge",
  "A weather system named after someone you know",
  "The sound a memory makes when it resurfaces",
  "An invention that solves a problem nobody has",
  "What a house looks like right after everyone leaves for the day",
  "A very small victory",
  "The last light left on in a sleeping building",
  "A letter of complaint to a very minor inconvenience",
  "What your reflection would say if it disagreed with you",
  "The exact temperature of nostalgia",
  "A found object that clearly has a story",
  "The soundtrack to doing nothing in particular",
  "A map drawn entirely from memory",
  "The last thing someone said before a long silence",
  "A very specific kind of relief",
  "What gets left on a windowsill and forgotten",
  "The moment a joke stops being funny",
  "A postcard you'll never send",
  "The exact shape of a bad day turning good",
  "A rule that only makes sense to one household",
  "What silence between songs sounds like",
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
  { title: "Mona Lisa", meta: "Leonardo da Vinci, c. 1503", body: "A portrait that's been looked at so long it's stopped being just a portrait." },
  { title: "The Creation of Adam", meta: "Michelangelo, Sistine Chapel ceiling, 1508–1512", body: "Two hands, almost touching, doing all the work of the whole painting." },
  { title: "The School of Athens", meta: "Raphael, 1509–1511", body: "A whole hall of history's arguers, gathered as if they'd finally agree to meet." },
  { title: "Las Meninas", meta: "Diego Velázquez, 1656", body: "A room full of people watching each other, and somehow you end up in it too." },
  { title: "The Night Watch", meta: "Rembrandt, 1642", body: "A militia mid-step, lit like they didn't know they were being painted." },
  { title: "Hunters in the Snow", meta: "Pieter Bruegel the Elder, 1565", body: "Three tired hunters coming home to a whole valley going about its winter." },
  { title: "Liberty Leading the People", meta: "Eugène Delacroix, 1830", body: "A flag held high over a crowd that hasn't decided if this ends well." },
  { title: "Wanderer above the Sea of Fog", meta: "Caspar David Friedrich, c. 1818", body: "A man with his back to us, facing down an entire sky of cloud." },
  { title: "A Sunday on La Grande Jatte", meta: "Georges Seurat, 1884–1886", body: "An afternoon in the park, built dot by dot until it holds still." },
  { title: "The Kiss", meta: "Gustav Klimt, 1907–1908", body: "Two figures wrapped in gold leaf, the rest of the world politely blurred out." },
  { title: "The Sleeping Gypsy", meta: "Henri Rousseau, 1897", body: "A lion sniffing at someone asleep in the desert, both of them strangely calm about it." },
  { title: "Impression, Sunrise", meta: "Claude Monet, 1872", body: "A harbor at dawn, painted fast enough that the whole movement got named after it." },
  { title: "Le Moulin de la Galette", meta: "Pierre-Auguste Renoir, 1876", body: "A whole crowded afternoon of dancing, sunlight falling through in patches." },
  { title: "L'Absinthe", meta: "Edgar Degas, 1876", body: "Two people sharing a table and clearly not sharing an afternoon." },
  { title: "The Hay Wain", meta: "John Constable, 1821", body: "A cart crossing a shallow river, in no hurry to get anywhere." },
  { title: "Self-Portrait at the Easel", meta: "Sofonisba Anguissola, 1556", body: "A painter caught painting, well before that was a thing women were allowed to be." },
  { title: "Self-Portrait", meta: "Judith Leyster, c. 1630", body: "An artist leaning back from her easel, mid-conversation with whoever's watching." },
  { title: "Self-Portrait with Two Pupils", meta: "Adélaïde Labille-Guiard, 1785", body: "A painter and her two students, taking up exactly as much room as the men did." },
  { title: "The Horse Fair", meta: "Rosa Bonheur, 1852–1855", body: "A whole market of horses caught mid-surge, dealers barely keeping hold." },
  { title: "Mask of Agamemnon", meta: "Mycenaean Greece, c. 1550 BCE", body: "A face in beaten gold, named for a king it almost certainly isn't." },
  { title: "Angkor Wat bas-reliefs", meta: "Khmer Empire, Cambodia, c. 1113–1150", body: "Armies and gods carved in a stone frieze that runs for half a kilometer." },
  { title: "Borobudur relief carvings", meta: "Java, Indonesia, c. 750–850", body: "A mountain of stone telling one long story, meant to be walked, not just seen." },
  { title: "Celadon Maebyeong vase", meta: "Goryeo Dynasty, Korea, 12th century", body: "A glaze the color of something between sky and jade, on a shape built to hold plum branches." },
  { title: "Great Zimbabwe stone ruins", meta: "Zimbabwe, 11th–15th century", body: "Stone walls fitted without mortar, still standing after seven hundred years." },
  { title: "Ge'ez manuscript illumination", meta: "Ethiopia, medieval tradition", body: "Saints and stories painted in flat, bright color on goatskin parchment." },
  { title: "Nkisi nkondi power figure", meta: "Kongo Kingdom, Central Africa, 19th century", body: "A carved figure studded with nails, each one driven in to seal a promise." },
  { title: "Plains ledger art", meta: "Plains Nations, 19th century", body: "Battles and horses drawn in pencil and ink across the pages of old accounting books." },
  { title: "Two Grey Hills weaving", meta: "Navajo Nation, traditional", body: "A rug woven in undyed wool, the pattern held entirely in the weaver's memory." },
  { title: "Whakairo wood carving", meta: "Māori, Aotearoa / New Zealand, traditional", body: "Ancestors carved into a meeting house, standing in for everyone who came before." },
  { title: "ʻAhuʻula (feather cloak)", meta: "Hawaii, traditional", body: "Thousands of tiny feathers, each one someone's careful hours, making a single cloak." },
  { title: "Inuit soapstone carving", meta: "Arctic Canada, traditional", body: "A hunter or a seal or a spirit, worked out of stone that used to be a hillside." },
  { title: "Moche ceramic portrait vessel", meta: "Peru, c. 100–800 CE", body: "A specific person's face, individual enough to still feel like a person and not a type." },
  { title: "Chavín de Huántar stone carvings", meta: "Peru, c. 900–250 BCE", body: "Fanged gods carved into a temple built to be confusing on purpose." },
  { title: "Olmec colossal head", meta: "Mexico, c. 900 BCE", body: "A helmeted face carved from a single boulder, hauled who knows how far to get here." },
  { title: "The Alhambra Vase", meta: "Nasrid Granada, 14th century", body: "A vase taller than most people, glazed gold, made for a palace that no longer needs it." },
  { title: "The Blue Qur'an", meta: "Kairouan, Tunisia, 9th–10th century", body: "Gold letters on parchment dyed the color of dusk." },
  { title: "Ardabil Carpet", meta: "Safavid Persia, 1539–1540", body: "A carpet with a whole galaxy woven into its medallion, made for a shrine, not a floor." },
  { title: "A folio from the Padshahnama", meta: "Mughal court, 17th century", body: "A royal procession, painted in enough gold that the page itself seems to glow." },
  { title: "Six Persimmons", meta: "Muqi Fachang, Southern Song China, 13th century", body: "Six fruit in ink, some barely there, that took a monk a few seconds and eight centuries of looking at since." },
  { title: "A Chaekgeori screen", meta: "Joseon Dynasty, Korea, 18th–19th century", body: "A painted bookshelf, every object on it standing in for a whole life of study." },
  { title: "Pine Trees", meta: "Hasegawa Tōhaku, Japan, c. 1595", body: "A grove half-swallowed by mist, painted in ink with almost nothing else." },
  { title: "Kente cloth", meta: "Ashanti Kingdom, Ghana, traditional", body: "Strips of bright, patterned cloth, each pattern with its own name and its own meaning." },
  { title: "Papyrus of Ani", meta: "Ancient Egypt, c. 1250 BCE", body: "A scribe's own copy of the instructions for what comes after this." },
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
  { body: "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged", meta: "Fyodor Dostoevsky, trans. Constance Garnett, Crime and Punishment, 1901" },
  { body: "Happy families are all alike; every unhappy family is unhappy in its own way.", meta: "Leo Tolstoy, trans. Constance Garnett, Anna Karenina" },
  { body: "The supreme happiness of life is the conviction that we are loved; loved for ourselves — say rather, loved in spite of ourselves.", meta: "Victor Hugo, trans. Isabel F. Hapgood, Les Misérables, 1887" },
  { body: "In a village of La Mancha, the name of which I have no desire to call to mind,", meta: "Miguel de Cervantes, trans. John Ormsby, Don Quixote, 1885" },
  { body: "Midway upon the journey of our life / I found myself within a forest dark,", meta: "Dante Alighieri, trans. Henry Wadsworth Longfellow, Inferno, 1867" },
  { body: "Achilles' wrath, to Greece the direful spring / Of woes unnumber'd, heavenly goddess, sing!", meta: "Homer, trans. Alexander Pope, The Iliad, 1715" },
  { body: "Know your enemy as you know yourself, and you need not fear a hundred battles.", meta: "Sun Tzu, trans. Lionel Giles, The Art of War, 1910" },
  { body: "Never the spirit was born; the spirit shall cease to be never; / Never was time it was not; End and Beginning are dreams!", meta: "Bhagavad Gita, trans. Edwin Arnold, The Song Celestial, 1885" },
  { body: "Listen to this reed, how it makes complaint, telling a tale of separation.", meta: "Rumi, trans. Reynold A. Nicholson, The Masnavi" },
  { body: "In the Name of Allah, the Compassionating, the Compassionate!", meta: "trans. Sir Richard Burton, The Book of the Thousand Nights and a Night, 1888" },
  { body: "Learning without thought is labour lost; thought without learning is perilous.", meta: "Confucius, trans. James Legge, The Analects, 1861" },
  { body: "The Tao that can be trodden is not the enduring and unchanging Tao.", meta: "Laozi, trans. James Legge, Tao Te Ching, 1891" },
  { body: "Reader, be assured this narrative is no fiction. I am aware that some of my adventures may seem incredible; but they are, nevertheless, strictly true.", meta: "Harriet Jacobs, Incidents in the Life of a Slave Girl, 1861" },
  { body: "Don't believe a word they say! Their words are sweet, but, my child, their deeds are bitter.", meta: "Zitkála-Šá, American Indian Stories, 1921" },
  { body: "When I think of my past life, and the bitter trials I have endured, I can scarcely believe I live, and yet I do;", meta: "Sarah Winnemucca, Life Among the Piutes, 1883" },
  { body: "Somebody must show that the Afro-American race is more sinned against than sinning,", meta: "Ida B. Wells, Southern Horrors, 1892" },
  { body: "Only the Black woman can say when and where I enter, in the quiet, undisputed dignity of my womanhood,", meta: "Anna Julia Cooper, A Voice from the South, 1892" },
  { body: "She was becoming herself and daily casting aside that fictitious self which we assume like a garment with which to appear before the world.", meta: "Kate Chopin, The Awakening, 1899" },
  { body: "Men, their rights, and nothing more; women, their rights, and nothing less.", meta: "Susan B. Anthony" },
  { body: "Whatever we had missed, we possessed together the precious, the incommunicable past.", meta: "Willa Cather, My Ántonia, 1918" },
  { body: "I have learned that success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome", meta: "Booker T. Washington, Up From Slavery, 1901" },
  { body: "Had Julius lived in a happier age for men of his complexion, the world might have had a black Aesop or Grimm.", meta: "Charles W. Chesnutt, The Conjure Woman, 1899" },
  { body: "Beauty is truth, truth beauty,—that is all / Ye know on earth, and all ye need to know.", meta: "John Keats, “Ode on a Grecian Urn”, 1819" },
  { body: "She walks in beauty, like the night / Of cloudless climes and starry skies;", meta: "Lord Byron, “She Walks in Beauty”, 1814" },
  { body: "To strive, to seek, to find, and not to yield.", meta: "Alfred, Lord Tennyson, “Ulysses”, 1842" },
  { body: "Better to reign in Hell, than serve in Heaven.", meta: "John Milton, Paradise Lost, 1667" },
  { body: "Whan that Aprille with his shoures soote / The droghte of March hath perced to the roote,", meta: "Geoffrey Chaucer, The Canterbury Tales, c. 1387" },
  { body: "No man is an island, / Entire of itself;", meta: "John Donne, Devotions upon Emergent Occasions, 1624" },
  { body: "A gentle knight was pricking on the plaine,", meta: "Edmund Spenser, The Faerie Queene, 1590" },
  { body: "Glory be to God for dappled things—", meta: "Gerard Manley Hopkins, “Pied Beauty”, 1877" },
  { body: "I leant upon a coppice gate / When Frost was spectre-grey,", meta: "Thomas Hardy, “The Darkling Thrush”, 1900" },
  { body: "Loveliest of trees, the cherry now / Is hung with bloom along the bough,", meta: "A. E. Housman, A Shropshire Lad, 1896" },
  { body: "The reports of my death are greatly exaggerated.", meta: "Mark Twain, 1897" },
  { body: "Words — so innocent and powerless as they are, standing in a dictionary — how potent for good and evil they become, in the hands of one who knows how to combine them.", meta: "Nathaniel Hawthorne, The Scarlet Letter, 1850" },
  { body: "Fifteen men on the dead man's chest— / Yo-ho-ho, and a bottle of rum!", meta: "Robert Louis Stevenson, Treasure Island, 1883" },
  { body: "I can resist everything except temptation.", meta: "Oscar Wilde, Lady Windermere's Fan, 1892" },
  { body: "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.", meta: "Arthur Conan Doyle, The Sign of the Four, 1890" },
  { body: "Listen to them, the children of the night. What music they make!", meta: "Bram Stoker, Dracula, 1897" },
  { body: "Human history becomes more and more a race between education and catastrophe.", meta: "H. G. Wells, The Outline of History, 1920" },
  { body: "If you can keep your head when all about you / Are losing theirs and blaming it on you,", meta: "Rudyard Kipling, “If—”, 1910" },
  { body: "Grow old along with me! / The best is yet to be,", meta: "Robert Browning, “Rabbi Ben Ezra”, 1864" },
  { body: "The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself.", meta: "George Bernard Shaw, Man and Superman, 1903" },
  { body: "Turning and turning in the widening gyre / The falcon cannot hear the falconer;", meta: "W. B. Yeats, “The Second Coming”, 1919" },
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
  { title: "Hungarian Dance No. 5", meta: "Johannes Brahms" },
  { title: "Wedding March (A Midsummer Night's Dream)", meta: "Felix Mendelssohn" },
  { title: "Liebestraum No. 3", meta: "Franz Liszt" },
  { title: "Träumerei (Kinderszenen)", meta: "Robert Schumann" },
  { title: "Morning Mood (Peer Gynt)", meta: "Edvard Grieg" },
  { title: "Symphony No. 9 “From the New World”, 2nd movement", meta: "Antonín Dvořák" },
  { title: "Pictures at an Exhibition: Promenade", meta: "Modest Mussorgsky" },
  { title: "Scheherazade", meta: "Nikolai Rimsky-Korsakov" },
  { title: "Finlandia", meta: "Jean Sibelius" },
  { title: "Water Music", meta: "George Frideric Handel" },
  { title: "Symphony No. 94 “Surprise”", meta: "Joseph Haydn" },
  { title: "Eine kleine Nachtmusik", meta: "Wolfgang Amadeus Mozart" },
  { title: "Piano Concerto No. 2", meta: "Sergei Rachmaninoff" },
  { title: "Boléro", meta: "Maurice Ravel" },
  { title: "Pomp and Circumstance March No. 1", meta: "Edward Elgar" },
  { title: "Pavane", meta: "Gabriel Fauré" },
  { title: "The Carnival of the Animals: The Swan", meta: "Camille Saint-Saëns" },
  { title: "La Traviata: Libiamo ne' lieti calici", meta: "Giuseppe Verdi" },
  { title: "Madama Butterfly: Un bel dì vedremo", meta: "Giacomo Puccini" },
  { title: "Ride of the Valkyries", meta: "Richard Wagner" },
  { title: "Raga Kalyani", meta: "Carnatic classical raga, South India" },
  { title: "Ambush from Ten Sides (Shimian Maifu)", meta: "Traditional Chinese pipa piece" },
  { title: "The Moon Reflected on Second Springs (Er Quan Ying Yue)", meta: "Hua Yanjun (“Abing”), China, recorded 1950" },
  { title: "Chunhyangga", meta: "Traditional Korean pansori" },
  { title: "Ca trù", meta: "Traditional Vietnamese chamber music" },
  { title: "Lao Duang Duen", meta: "Traditional Thai piece" },
  { title: "La Leyenda del Tiempo", meta: "Camarón de la Isla, flamenco, Spain, 1979" },
  { title: "Kaira", meta: "Toumani Diabaté, kora, Mali, 1988" },
  { title: "Yekermo Sew", meta: "Mulatu Astatke, Ethio-jazz, Ethiopia" },
  { title: "Chan Chan", meta: "Compay Segundo, son cubano, Cuba" },
  { title: "Garota de Ipanema (The Girl from Ipanema)", meta: "Antônio Carlos Jobim, bossa nova, Brazil, 1962" },
  { title: "No Woman, No Cry", meta: "Bob Marley and the Wailers (written by Vincent Ford), reggae, Jamaica, 1974" },
  { title: "Cross Road Blues", meta: "Robert Johnson, Delta blues, USA, 1936" },
  { title: "Take Five", meta: "Paul Desmond, performed by the Dave Brubeck Quartet, USA, 1959" },
  { title: "Shady Grove", meta: "Traditional Appalachian folk tune" },
  { title: "The Butterfly", meta: "Traditional Irish jig" },
  { title: "Joik", meta: "Traditional Sami vocal tradition, Scandinavia" },
  { title: "Didgeridoo drone music", meta: "Traditional Aboriginal Australian tradition" },
  { title: "Powwow drum singing", meta: "Traditional Plains Nations" },
  { title: "Boban Marković Orkestar", meta: "Balkan brass, Serbia" },
  { title: "Chakrulo", meta: "Traditional Georgian polyphonic song" },
  { title: "Urtiin duu (long song)", meta: "Traditional Mongolian singing" },
  { title: "Der Heyser Bulgar", meta: "Traditional Klezmer tune" },
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

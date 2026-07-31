// In-app starter guides: one mini-course per practice, for someone who's
// curious but doesn't know where to begin (or feels locked up about it).
//
// Content policy, same spirit as the prompt bank: the advice itself is
// distilled conventional wisdom from each field, and every named book,
// channel, and site was checked against a real source before shipping --
// nothing recommended from memory alone. Links follow the app's rule of
// never hardcoding a video URL: YouTube recommendations are *search* links,
// book recommendations are Google search links, and only stable
// organizations' own domains (poets.org, drawabox.com) are linked directly.
// The guides are honestly labeled as AI-generated in the UI.

import { openSheet } from "./sheet.js";
import { youtubeSearchUrl } from "./prompts.js";

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const GUIDES = [
  {
    id: "daily-practice",
    title: "A daily creative practice",
    tagline: "Small, steady, and kind to yourself.",
    sections: [
      {
        heading: "Start embarrassingly small",
        paragraphs: [
          "Ten minutes counts. One sketch counts. Three lines count. The single biggest predictor of a creative practice sticking is not talent or time — it's whether the daily bar is low enough that you can clear it on your worst day.",
          "That's why this app counts days instead of streaks: missing a day never takes anything away from you. The chain isn't the point. The returning is.",
        ],
      },
      {
        heading: "Try morning pages",
        paragraphs: [
          "From Julia Cameron's The Artist's Way, one of the most-used exercises in any creative tradition: three pages of longhand, stream-of-consciousness writing, first thing, about anything. Never reread them, never show anyone. They're not writing — they're clearing the pipes so the writing can happen.",
        ],
      },
      {
        heading: "Collect, then remix",
        paragraphs: [
          "Austin Kleon's Steal Like an Artist makes the case that nothing is wholly original — every artist you love is a remix of the artists they loved. So gather influences shamelessly: save lines, images, and ideas that stop you. My Log works well as that collection.",
        ],
      },
      {
        heading: "Done, not good",
        paragraphs: [
          "Perfectionism is the practice-killer. Aim to finish small things regularly rather than polish one thing forever — quantity, over time, is what quality grows out of. Give yourself explicit permission to make bad things on purpose.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Log one tiny thing for today's prompt — a single sentence counts. If that feels like too much, lower the bar until it doesn't.",
        ],
      },
    ],
    resources: [
      { label: "The Artist's Way — Julia Cameron", note: "The classic 12-week program; origin of morning pages.", href: googleSearchUrl("The Artist's Way Julia Cameron book") },
      { label: "Steal Like an Artist — Austin Kleon", note: "Short, friendly, and freeing about influence and originality.", href: googleSearchUrl("Steal Like an Artist Austin Kleon book") },
      { label: "The Art Assignment (YouTube)", note: "PBS series of do-able assignments from working artists.", href: youtubeSearchUrl("The Art Assignment PBS") },
    ],
  },
  {
    id: "drawing",
    title: "Drawing",
    tagline: "A learnable skill, not a gift.",
    sections: [
      {
        heading: "Draw what you see, not what you know",
        paragraphs: [
          "The classic beginner's wall: your hand draws the symbol of an eye or a cup that lives in your head, instead of the actual shapes in front of you. Betty Edwards built a whole method around switching that off. A famous exercise: copy a photo upside-down — with the symbols scrambled, you're forced to draw the lines you actually see, and most people shock themselves with the result.",
        ],
      },
      {
        heading: "Fill cheap sketchbooks",
        paragraphs: [
          "Buy sketchbooks you don't respect. A precious sketchbook makes precious drawings; a cheap one gives you permission to be bad, which is the only road to being good. One object a day is plenty: the coffee cup, your other hand, whatever's in front of you.",
        ],
      },
      {
        heading: "Fundamentals, slowly — and the 50% rule",
        paragraphs: [
          "Confident lines, ellipses, and boxes in perspective are to drawing what scales are to piano; Drawabox's free course drills exactly these. But it also insists on a rule worth stealing: spend at least half your drawing time just drawing for fun, no exercises, no goal. Practice feeds play; play is the reason.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Draw the nearest object in one continuous line, without lifting the pen or looking at the paper more than twice. Photograph it and log it — bad on purpose is the assignment.",
        ],
      },
    ],
    resources: [
      { label: "Drawing on the Right Side of the Brain — Betty Edwards", note: "The standard text for learning to see; used in art schools worldwide.", href: googleSearchUrl("Drawing on the Right Side of the Brain Betty Edwards book") },
      { label: "Drawabox (free course)", note: "Free, structured fundamentals — lines, ellipses, boxes, spatial thinking.", href: "https://drawabox.com" },
      { label: "Proko — Drawing Basics (YouTube)", note: "Stan Prokopenko's free beginner playlist; clear and funny.", href: youtubeSearchUrl("Proko Drawing Basics playlist") },
    ],
  },
  {
    id: "poetry",
    title: "Poetry",
    tagline: "If you can notice, you can write a poem.",
    sections: [
      {
        heading: "Read one poem a day",
        paragraphs: [
          "Poetry is learned by ear, the way music is. Before worrying about writing well, get poems into your system: Poem-a-Day (free email from the Academy of American Poets) and the Poetry Foundation's site are endless, free, and current.",
          "Read them aloud — poems are built for the mouth, not the eye. And you're allowed to not \"get\" a poem. Finding one line you like is a complete reading.",
        ],
      },
      {
        heading: "Forget rhyme, for now",
        paragraphs: [
          "Nobody's grading you against Shakespeare. Most contemporary poetry is free verse — no rhyme scheme, no fixed meter. What makes a poem a poem is attention: one concrete image, precisely seen, beats any amount of abstract feeling. Show the cracked mug in the sink; don't write the word \"sadness\".",
        ],
      },
      {
        heading: "Copy the masters — literally",
        paragraphs: [
          "Imitation is the traditional apprenticeship. Take a poem you like and write your own version of it: keep its shape, swap in your life. Small forms are friendly on-ramps too — a haiku, a list poem, ten lines that each start with the same word.",
        ],
      },
      {
        heading: "Line breaks are breathing",
        paragraphs: [
          "The line break is poetry's one unique tool — it's where the poem breathes, and the word before a break carries extra weight. Read your draft aloud and break the lines where you actually pause. Then break one line somewhere surprising and see what changes.",
          "And revise later, not while writing. First drafts are for collecting; you're allowed to write badly on the way to the poem.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Write three lines about something you actually saw today. No metaphor required, no rhyme allowed. Log it as a Poem — the full-screen editor is waiting.",
        ],
      },
    ],
    resources: [
      { label: "A Poetry Handbook — Mary Oliver", note: "Short, warm, and practical — the gentlest serious introduction there is.", href: googleSearchUrl("A Poetry Handbook Mary Oliver book") },
      { label: "The Ode Less Travelled — Stephen Fry", note: "Funny hands-on tour of meter and form, with exercises.", href: googleSearchUrl("The Ode Less Travelled Stephen Fry book") },
      { label: "Ours Poetica (YouTube)", note: "People reading poems they love — from the Poetry Foundation and the team behind Crash Course.", href: youtubeSearchUrl("Ours Poetica") },
      { label: "Poem-a-Day — poets.org", note: "A free new poem in your inbox every morning.", href: "https://poets.org/poem-a-day" },
    ],
  },
  {
    id: "short-stories",
    title: "Short stories",
    tagline: "A complete art form that fits in a week.",
    sections: [
      {
        heading: "Give yourself a terrible first draft",
        paragraphs: [
          "Anne Lamott's Bird by Bird made this the most-quoted advice in writing: every good story starts as a bad draft that nobody else will ever see. The draft's only job is to exist. Fixing it is a separate, later, much easier job.",
        ],
      },
      {
        heading: "Read like a writer",
        paragraphs: [
          "Take one short story you love and read it twice: once as a reader, once as a mechanic. Where does it start — and notice how late that is. Who's telling it? What's the last line doing? One story studied closely teaches more than ten skimmed.",
        ],
      },
      {
        heading: "Constraints are fuel",
        paragraphs: [
          "A blank page with infinite options is paralysis. One scene, two characters, 500 words is a story you can actually finish. Start as close to the end as you dare — most first drafts begin two pages before the story does.",
        ],
      },
      {
        heading: "Finish things",
        paragraphs: [
          "A finished, flawed story teaches you more than a perfect, abandoned one — endings are a skill you can only practice by reaching them. Brandon Sanderson's university lectures (free on YouTube) are full of this kind of craft-as-craft honesty, and they cover short fiction specifically.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Write a 100-word story from today's prompt. Exactly 100 words is the constraint — you'll be surprised what cutting to fit teaches.",
        ],
      },
    ],
    resources: [
      { label: "Bird by Bird — Anne Lamott", note: "On drafts, doubt, and writing anyway. Beloved for a reason.", href: googleSearchUrl("Bird by Bird Anne Lamott book") },
      { label: "On Writing — Stephen King", note: "Half memoir, half toolbox; the most re-read craft book there is.", href: googleSearchUrl("On Writing A Memoir of the Craft Stephen King book") },
      { label: "Steering the Craft — Ursula K. Le Guin", note: "Compact exercises on sentences, viewpoint, and voice.", href: googleSearchUrl("Steering the Craft Ursula K. Le Guin book") },
      { label: "Brandon Sanderson's BYU lectures (YouTube)", note: "A full university creative-writing course, free.", href: youtubeSearchUrl("Brandon Sanderson BYU writing lectures") },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    tagline: "The camera you already have is enough.",
    sections: [
      {
        heading: "Chase light, not subjects",
        paragraphs: [
          "Photography means writing with light, and light is the whole game. The same street is boring at noon and cinematic an hour before sunset. Start noticing where light falls in your home during the day — window light alone can carry years of photographs.",
        ],
      },
      {
        heading: "Composition first, settings later",
        paragraphs: [
          "Fill the frame with what you mean, then check the edges for what you don't. Those two habits improve photos faster than any camera setting. The technical side — how aperture, shutter speed, and ISO trade against each other — is one book away when you're ready; Bryan Peterson's Understanding Exposure has taught it to generations.",
        ],
      },
      {
        heading: "Shoot projects, not singles",
        paragraphs: [
          "Ten photos of one thing beats one photo of ten things. Pick a constraint — one color for a week, one street, the same corner every morning — and the constraint will start showing you pictures you'd never have hunted down.",
        ],
      },
      {
        heading: "Ask why, not just how",
        paragraphs: [
          "Sean Tucker's videos and his book The Meaning in the Making are the calm voice in a gear-obsessed field: what matters is what you're paying attention to, and why. Good antidote whenever you start believing a better camera is the missing piece.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Take ten photos of one ordinary object — different angles, distances, light. Keep exactly one and log it. Deleting nine is the lesson.",
        ],
      },
    ],
    resources: [
      { label: "Understanding Exposure — Bryan Peterson", note: "The standard friendly intro to aperture, shutter, and ISO.", href: googleSearchUrl("Understanding Exposure Bryan Peterson book") },
      { label: "The Meaning in the Making — Sean Tucker", note: "On the why of creating; more philosophy than f-stops.", href: googleSearchUrl("The Meaning in the Making Sean Tucker book") },
      { label: "Sean Tucker (YouTube)", note: "Thoughtful videos on light, story, and the creative life.", href: youtubeSearchUrl("Sean Tucker photography") },
    ],
  },
  {
    id: "film",
    title: "Film",
    tagline: "A phone and a free editor is a studio.",
    sections: [
      {
        heading: "Watch actively",
        paragraphs: [
          "Filmmaking is learned mostly by rewatching. Take a scene you love, mute it, and count the cuts — where the camera is, when it moves, why it cuts. The late, great video-essay series Every Frame a Painting is a masterclass in exactly this kind of looking.",
        ],
      },
      {
        heading: "Editing is the art",
        paragraphs: [
          "A film is made three times — written, shot, and cut — and the cut is where it becomes a film. Walter Murch's tiny classic In the Blink of an Eye argues emotion beats technical continuity every time: cut when the feeling says cut. You can practice editing with free tools on the phone in your pocket.",
        ],
      },
      {
        heading: "Make one-minute films",
        paragraphs: [
          "Don't start with a short film; start with a minute. A day condensed to six shots. A coffee being made, told like a heist. One rule per film — this one's about framing, that one's about sound — and finish each one.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Film five 5-second clips across your day, then cut them together in order, no music. Log the result as a Link or a Note about what you'd do differently — that note is the film school.",
        ],
      },
    ],
    resources: [
      { label: "In the Blink of an Eye — Walter Murch", note: "The essential little book on why and when to cut.", href: googleSearchUrl("In the Blink of an Eye Walter Murch book") },
      { label: "Every Frame a Painting (YouTube)", note: "Video essays on film form — the gold standard.", href: youtubeSearchUrl("Every Frame a Painting") },
      { label: "StudioBinder (YouTube)", note: "Deep, well-produced breakdowns of shots, blocking, and directing technique.", href: youtubeSearchUrl("StudioBinder filmmaking techniques") },
    ],
  },
  {
    id: "mixed-media",
    title: "Mixed media & more",
    tagline: "For the gloriously uncategorizable.",
    sections: [
      {
        heading: "Permission to play",
        paragraphs: [
          "Collage, art journals, tiny sculptures, embroidery on junk mail — this is the territory where process officially outranks product. Keri Smith's Wreck This Journal became a phenomenon by making destruction the assignment: poke holes, spill coffee, tear pages. It works because it kills preciousness, and preciousness is the enemy.",
        ],
      },
      {
        heading: "Let assignments decide",
        paragraphs: [
          "When \"make anything\" freezes you, borrow a task. The Art Assignment (and its book, You Are an Artist) collects dozens of prompts from working artists — make a meal that's a self-portrait, document a walk, construct a monument from what's in one drawer. Your daily prompt here works the same way: it decides, you make.",
        ],
      },
      {
        heading: "Use what's at hand",
        paragraphs: [
          "Materials shouldn't cost courage. Junk mail, packaging, old magazines, receipts, leaves — a glue stick and a stack of paper headed for recycling is a full studio. Working with worthless materials keeps the stakes exactly where they belong: at zero.",
        ],
      },
      {
        heading: "Start today",
        paragraphs: [
          "Tear five shapes from something in your recycling, arrange them until they look like something (or pleasingly like nothing), glue, photograph, log. Total time: ten minutes.",
        ],
      },
    ],
    resources: [
      { label: "Wreck This Journal — Keri Smith", note: "The anti-precious classic; destruction as a creative warm-up.", href: googleSearchUrl("Wreck This Journal Keri Smith book") },
      { label: "You Are an Artist — Sarah Urist Green", note: "Assignments from working artists, adapted from The Art Assignment.", href: googleSearchUrl("You Are an Artist Sarah Urist Green book") },
      { label: "The Art Assignment (YouTube)", note: "The series itself — watchable proof that anything can be a practice.", href: youtubeSearchUrl("The Art Assignment PBS") },
    ],
  },
];

export function openGuidesSheet() {
  const sheet = openSheet("tpl-guides");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());

  const list = el.querySelector("#guides-list");
  for (const guide of GUIDES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-item";
    btn.innerHTML = `
      <span class="guide-item-text">
        <span class="guide-item-title">${guide.title}</span>
        <span class="guide-item-tagline">${guide.tagline}</span>
      </span>
      <svg class="icon icon-line guide-item-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    `;
    btn.addEventListener("click", () => openGuideDetail(guide));
    list.appendChild(btn);
  }
}

function openGuideDetail(guide) {
  // Opened on top of the list sheet (openSheet stacks), so closing the
  // detail drops you back on the list to browse another guide.
  const sheet = openSheet("tpl-guide-detail");
  const el = sheet.el;
  el.querySelector(".close-btn").addEventListener("click", () => sheet.close());
  el.querySelector("#guide-detail-title").textContent = guide.title;

  const body = el.querySelector("#guide-detail-body");
  for (const section of guide.sections) {
    const sec = document.createElement("section");
    const h = document.createElement("h3");
    h.textContent = section.heading;
    sec.appendChild(h);
    for (const text of section.paragraphs) {
      const p = document.createElement("p");
      p.textContent = text;
      sec.appendChild(p);
    }
    body.appendChild(sec);
  }

  const resSec = document.createElement("section");
  const resH = document.createElement("h3");
  resH.textContent = "Go deeper";
  resSec.appendChild(resH);
  const resWrap = document.createElement("div");
  resWrap.className = "guide-resources";
  for (const r of guide.resources) {
    const a = document.createElement("a");
    a.className = "guide-resource";
    a.href = r.href;
    a.target = "_blank";
    a.rel = "noopener";
    const t = document.createElement("span");
    t.className = "guide-resource-title";
    t.textContent = `${r.label} ↗`;
    const n = document.createElement("span");
    n.className = "guide-resource-note";
    n.textContent = r.note;
    a.appendChild(t);
    a.appendChild(n);
    resWrap.appendChild(a);
  }
  resSec.appendChild(resWrap);
  body.appendChild(resSec);
}

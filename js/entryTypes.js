import { ICON_NOTE, ICON_POEM, ICON_BOOK, ICON_IMAGE, ICON_GALLERY, ICON_LINK } from "./icons.js";

export const ENTRY_TYPES = [
  { id: "note", label: "Note", icon: ICON_NOTE, placeholder: "Jot down what you made, or just a short log…", long: false, serif: false },
  { id: "poem", label: "Poem", icon: ICON_POEM, placeholder: "Write your poem…", long: true, serif: true },
  { id: "story", label: "Short story", icon: ICON_BOOK, placeholder: "Write your story…", long: true, serif: true },
  { id: "image", label: "Image", icon: ICON_IMAGE, placeholder: "Caption (optional)…", long: false, serif: false },
  { id: "gallery", label: "Gallery", icon: ICON_GALLERY, placeholder: "Caption (optional)…", long: false, serif: false },
  { id: "link", label: "Link", icon: ICON_LINK, placeholder: "What is this a link to?", long: false, serif: false },
];

export function typeFor(id) {
  return ENTRY_TYPES.find((t) => t.id === id) || ENTRY_TYPES[0];
}

export function ordinal(n) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

// "14th of July 2026" -- the specific ordinal-first phrasing this app uses
// for the prompt date, rather than a locale-formatted date.
export function formatPromptDate(dateKey) {
  const d = new Date(`${dateKey}T00:00:00`);
  const day = ordinal(d.getDate());
  const month = d.toLocaleDateString(undefined, { month: "long" });
  return `${day} of ${month} ${d.getFullYear()}`;
}

export function formatDate(dateKey) {
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function formatDateShort(dateKey) {
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function hostnameFor(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// Autogrows a textarea to fit its content -- the "minimalistic editor" grows
// with what you write instead of scrolling inside a fixed box.
export function autogrow(textarea) {
  const resize = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  textarea.addEventListener("input", resize);
  resize();
}

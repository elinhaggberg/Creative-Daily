import { renderHome } from "./views/home.js";
import { renderLog } from "./views/log.js";
import { renderCalendar } from "./views/calendar.js";
import { applyTheme } from "./theme.js";

applyTheme();

const root = document.getElementById("app");

const nav = {
  toHome: () => {
    location.hash = "#/home";
  },
  toLog: () => {
    location.hash = "#/log";
  },
  toCalendar: () => {
    location.hash = "#/calendar";
  },
};

function route() {
  const hash = location.hash || "#/home";
  const view = hash.replace(/^#\//, "").split("/")[0];

  switch (view) {
    case "log":
      renderLog(root, nav);
      break;
    case "calendar":
      renderCalendar(root, nav);
      break;
    default:
      renderHome(root, nav);
  }
}

window.addEventListener("hashchange", route);
route();

// A new service worker activates in the background (it already takes over
// immediately via skipWaiting/clients.claim) but an already-open tab keeps
// running the JS it loaded at open time regardless -- so it needs a reload
// to actually pick up the new code. Reloading the instant that happens
// would yank away whatever's on screen at a moment the update has nothing
// to do with, so instead it waits until it's safe: right away if the tab
// is already backgrounded, or the next time it gets backgrounded if it's
// in front of you right now -- simply fresh again by the time you come
// back, same as a normal reopen. The actual "you're updated" signal is
// whatsNew.js's sheet, keyed off APP_VERSION, not this reload itself.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => reg.update())
      .catch(() => {});
  });

  let updatePending = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updatePending) return;
    updatePending = true;
    if (document.hidden) {
      window.location.reload();
    } else {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) window.location.reload();
      });
    }
  });
}

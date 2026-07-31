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

// If the previous load's service worker update reloaded the page to apply
// itself (see below), say so -- otherwise an update is invisible: the app
// just quietly starts working differently one day, with nothing to confirm
// a fresh version actually landed on this device.
const JUST_UPDATED_KEY = "cd_just_updated_v1";
if (localStorage.getItem(JUST_UPDATED_KEY)) {
  localStorage.removeItem(JUST_UPDATED_KEY);
  showUpdatedToast();
}

function showUpdatedToast() {
  const toast = document.createElement("div");
  toast.className = "update-toast";
  toast.textContent = "Updated to the latest version";
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
}

if ("serviceWorker" in navigator) {
  // Only a real update should announce itself -- the very first time this
  // app is ever opened, the controllerchange below fires too (no controller
  // -> an active one), but there's nothing to call an "update" yet.
  const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);

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
    if (hadControllerAtLoad) localStorage.setItem(JUST_UPDATED_KEY, "1");
    if (document.hidden) {
      window.location.reload();
    } else {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) window.location.reload();
      });
    }
  });
}

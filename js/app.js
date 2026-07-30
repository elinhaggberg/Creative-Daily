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

import { getOnboardingSeen, setOnboardingSeen } from "./storage.js";
import { openSheet } from "./sheet.js";

// Shows a condensed "how this app works" explainer exactly once, the very
// first time the app is ever opened on a device.
export function checkOnboarding() {
  if (getOnboardingSeen()) return;
  setOnboardingSeen();

  const sheet = openSheet("tpl-how-it-works");
  sheet.el.querySelector(".close-btn").addEventListener("click", () => sheet.close());
  sheet.el.querySelector("#how-it-works-got-it-btn").addEventListener("click", () => sheet.close());
}

import { getDayNumber, todayKey, getEntriesForDate, shouldShowBackupBanner, dismissBackupBanner, markBackedUp, exportBackupData } from "../storage.js";
import { buildPromptCard, renderEntryNodesInto, addEntryForDate } from "../dayDetail.js";
import { openSettingsMenu } from "../settingsMenu.js";
import { checkOnboarding } from "../onboarding.js";
import { checkWhatsNew } from "../whatsNew.js";
import { shareOrDownload, filenameFor } from "../share.js";

export async function renderHome(root, nav) {
  const tpl = document.getElementById("tpl-home");
  root.replaceChildren(tpl.content.cloneNode(true));

  const today = todayKey();
  const dayNumber = await getDayNumber(today);
  root.querySelector("#home-daynum").textContent = `Day ${dayNumber}`;

  root.querySelector("#menu-btn").addEventListener("click", () => openSettingsMenu(refresh));

  const entries = await getEntriesForDate(today);
  const homeBody = root.querySelector(".page-body");
  homeBody.classList.toggle("home-body-empty", entries.length === 0);

  const promptSlot = root.querySelector("#home-prompt-slot");
  promptSlot.replaceChildren(buildPromptCard(today, { variant: entries.length === 0 ? "hero" : "card" }));

  const entriesEl = root.querySelector("#home-entries");
  renderEntryNodesInto(entriesEl, entries, refresh);

  root.querySelector("#add-btn").addEventListener("click", () => addEntryForDate(today, refresh));

  async function refresh() {
    renderHome(root, nav);
  }

  const banner = root.querySelector("#backup-banner");
  if (await shouldShowBackupBanner()) {
    banner.classList.remove("hidden");
    banner.querySelector("#backup-now-btn").addEventListener("click", async () => {
      const data = await exportBackupData();
      await shareOrDownload(filenameFor("creative-daily-backup"), JSON.stringify(data, null, 2));
      markBackedUp();
      banner.classList.add("hidden");
    });
    banner.querySelector("#backup-dismiss-btn").addEventListener("click", () => {
      dismissBackupBanner();
      banner.classList.add("hidden");
    });
  }

  checkOnboarding();
  checkWhatsNew();
}

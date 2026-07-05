import type { ConversionResult } from "../shared/contracts";
import { triggerConversion } from "../shared/trigger";

const BADGE_DURATION = 3_000;

async function showBadge(tabId: number, result: ConversionResult): Promise<void> {
  const text =
    result.status === "completed"
      ? result.failed > 0
        ? "!"
        : String(result.converted)
      : result.status === "busy"
        ? "…"
        : "!";
  const color = result.status === "completed" && result.failed === 0 ? "#256341" : "#a23a31";
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
  await chrome.action.setBadgeText({ tabId, text });
  setTimeout(() => void chrome.action.setBadgeText({ tabId, text: "" }), BADGE_DURATION);
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "convert-page" || !tab?.id) return;
  void triggerConversion(tab)
    .then((result) => showBadge(tab.id!, result))
    .catch(() => undefined);
});

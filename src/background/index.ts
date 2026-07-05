import type { ConversionResult } from "../shared/contracts";
import { isShortcutResultRequest } from "../shared/messages";
import { triggerConversion } from "../shared/trigger";

const BADGE_DURATION = 3_000;
const shortcutResults = new Map<number, ConversionResult>();

async function showRunningBadge(tabId: number): Promise<void> {
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#835d0a" });
  await chrome.action.setBadgeText({ tabId, text: "…" });
}

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

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isShortcutResultRequest(message)) return false;
  const result = shortcutResults.get(message.tabId);
  if (result) shortcutResults.delete(message.tabId);
  sendResponse(result);
  return false;
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "convert-page" || !tab?.id) return;
  const tabId = tab.id;
  void showRunningBadge(tabId).catch(() => undefined);
  void triggerConversion(tab)
    .then(async (result) => {
      shortcutResults.set(tabId, result);
      setTimeout(() => shortcutResults.delete(tabId), 30_000);
      await Promise.allSettled([
        showBadge(tabId, result),
        chrome.action.openPopup({ windowId: tab.windowId }),
      ]);
    })
    .catch(() => undefined);
});

import type { ConversionResult } from "./contracts";
import { CONVERT_MESSAGE, isConversionResult } from "./messages";
import { isSupportedNotionUrl } from "./notion-url";

const emptyResult = (
  status: "unsupported" | "failed",
  message: string,
): ConversionResult => ({ status, converted: 0, skipped: 0, failed: status === "failed" ? 1 : 0, message });

export async function triggerConversion(tab: chrome.tabs.Tab): Promise<ConversionResult> {
  if (!tab.id || !isSupportedNotionUrl(tab.url)) {
    return emptyResult("unsupported", "Open an editable Notion page and try again.");
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    const result: unknown = await chrome.tabs.sendMessage(tab.id, {
      type: CONVERT_MESSAGE,
    });
    return isConversionResult(result)
      ? result
      : emptyResult("failed", "The page returned an unexpected response.");
  } catch {
    return emptyResult(
      "failed",
      "Chrome could not start conversion. Reload the Notion page and try again.",
    );
  }
}

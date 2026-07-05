import { presentResult, type StatusTone } from "./presentation";
import type { ConversionResult } from "../shared/contracts";
import { GET_SHORTCUT_RESULT_MESSAGE, isConversionResult } from "../shared/messages";
import { triggerConversion } from "../shared/trigger";

const button = document.querySelector<HTMLButtonElement>("#convert-button");
const status = document.querySelector<HTMLElement>("#status");
const shortcutModifier = document.querySelector<HTMLElement>("#shortcut");

if (!button || !status) throw new Error("Popup markup is incomplete.");
const convertButton = button;
const statusElement = status;
if (shortcutModifier && navigator.userAgent.includes("Mac")) {
  shortcutModifier.textContent = "⌘";
}

function setStatus(text: string, tone: StatusTone): void {
  statusElement.textContent = text;
  statusElement.dataset.tone = tone;
}

function showResult(result: Parameters<typeof presentResult>[0]): void {
  const presentation = presentResult(result);
  setStatus(presentation.text, presentation.tone);
}

async function showPendingShortcutResult(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const result: unknown = await chrome.runtime.sendMessage({
      type: GET_SHORTCUT_RESULT_MESSAGE,
      tabId: tab.id,
    });
    if (isConversionResult(result)) showResult(result);
  } catch {
    // The popup was opened normally and there is no pending shortcut result.
  }
}

void showPendingShortcutResult();

convertButton.addEventListener("click", async () => {
  convertButton.disabled = true;
  convertButton.dataset.loading = "true";
  setStatus("Converting equations…", "neutral");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result: ConversionResult =
      tab
        ? await triggerConversion(tab)
        : {
            status: "unsupported",
            converted: 0,
            skipped: 0,
            failed: 0,
            message: "No active page was found.",
          };
    showResult(result);
  } catch {
    setStatus("Chrome could not access the current page.", "error");
  } finally {
    convertButton.disabled = false;
    delete convertButton.dataset.loading;
  }
});

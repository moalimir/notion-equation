import { presentResult, type StatusTone } from "./presentation";
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

convertButton.addEventListener("click", async () => {
  convertButton.disabled = true;
  convertButton.dataset.loading = "true";
  setStatus("Converting equations…", "neutral");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const presentation = presentResult(
      tab
        ? await triggerConversion(tab)
        : {
            status: "unsupported",
            converted: 0,
            skipped: 0,
            failed: 0,
            message: "No active page was found.",
          },
    );
    setStatus(presentation.text, presentation.tone);
  } catch {
    setStatus("Chrome could not access the current page.", "error");
  } finally {
    convertButton.disabled = false;
    delete convertButton.dataset.loading;
  }
});

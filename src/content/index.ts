import type { ConversionResult } from "../shared/contracts";
import { CONVERT_MESSAGE, type ConvertMessage } from "../shared/messages";
import { runConversion } from "./run";

const RUNTIME_KEY = "__notionEquationRuntimeInstalled";
type RuntimeGlobal = typeof globalThis & { [RUNTIME_KEY]?: boolean };
const runtimeGlobal = globalThis as RuntimeGlobal;

if (!runtimeGlobal[RUNTIME_KEY]) {
  runtimeGlobal[RUNTIME_KEY] = true;
  let converting = false;

  chrome.runtime.onMessage.addListener(
    (message: ConvertMessage, _sender, sendResponse: (result: ConversionResult) => void) => {
      if (message?.type !== CONVERT_MESSAGE) return false;
      if (converting) {
        sendResponse({
          status: "busy",
          converted: 0,
          skipped: 0,
          failed: 0,
          message: "A conversion is already running on this page.",
        });
        return false;
      }

      converting = true;
      void runConversion()
        .then(sendResponse)
        .catch(() =>
          sendResponse({
            status: "failed",
            converted: 0,
            skipped: 0,
            failed: 1,
            message: "Conversion stopped unexpectedly.",
          }),
        )
        .finally(() => {
          converting = false;
        });
      return true;
    },
  );
}

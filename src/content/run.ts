import type { ConversionResult } from "../shared/contracts";
import { ConversionEngine } from "./engine";
import { NotionEquationDriver } from "./notion-driver";
import { NotionToggleController } from "./toggles";

export async function runConversion(): Promise<ConversionResult> {
  if (!document.body) {
    return {
      status: "failed",
      converted: 0,
      skipped: 0,
      failed: 1,
      message: "The Notion page is not ready.",
    };
  }

  window.focus();
  const engine = new ConversionEngine(
    new NotionEquationDriver(),
    new NotionToggleController(),
  );
  return engine.run(document.body);
}

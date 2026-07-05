import type { ConversionResult } from "../shared/contracts";
import {
  findNextCandidate,
  markEquationAttempted,
  type AttemptedEquations,
} from "./dom";
import type { EquationDriver } from "./notion-driver";
import type { ToggleController } from "./toggles";

const MAX_OPERATIONS = 500;
const STYLE_ID = "notion-equation-conversion-style";

interface Counters {
  converted: number;
  skipped: number;
  failed: number;
  operations: number;
}

function installConversionStyle(document: Document): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = [
    'div[role="dialog"] { opacity: 0 !important; transform: scale(0.001) !important; }',
    ".notion-text-action-menu { opacity: 0 !important; transform: scale(0.001) !important; pointer-events: none !important; }",
  ].join("\n");
  document.head.append(style);
}

function removeConversionStyle(document: Document): void {
  document.getElementById(STYLE_ID)?.remove();
}

export class ConversionEngine {
  readonly #attempted: AttemptedEquations = new WeakMap();
  readonly #processedToggles = new WeakSet<HTMLElement>();
  readonly #counters: Counters = { converted: 0, skipped: 0, failed: 0, operations: 0 };

  constructor(
    private readonly driver: EquationDriver,
    private readonly toggles: ToggleController,
    private readonly maxOperations = MAX_OPERATIONS,
  ) {}

  async run(root: HTMLElement): Promise<ConversionResult> {
    installConversionStyle(root.ownerDocument);
    try {
      await this.#scan(root);
      const limitReached = this.#counters.operations >= this.maxOperations;
      if (limitReached) this.#counters.failed += 1;
      return {
        status: "completed",
        converted: this.#counters.converted,
        skipped: this.#counters.skipped,
        failed: this.#counters.failed,
        ...(limitReached ? { message: "Stopped at the conversion safety limit." } : {}),
      };
    } catch {
      return {
        status: "failed",
        converted: this.#counters.converted,
        skipped: this.#counters.skipped,
        failed: this.#counters.failed + 1,
        message: "Conversion stopped because Notion changed unexpectedly.",
      };
    } finally {
      removeConversionStyle(root.ownerDocument);
    }
  }

  async #scan(root: HTMLElement): Promise<void> {
    while (this.#counters.operations < this.maxOperations) {
      const candidate = findNextCandidate(root, this.#attempted, this.#processedToggles);
      if (!candidate) return;
      this.#counters.operations += 1;

      if (candidate.type === "equation") {
        markEquationAttempted(this.#attempted, candidate.node, candidate.match);
        try {
          const outcome = await this.driver.convert(candidate.node, candidate.match);
          this.#counters[outcome] += 1;
        } catch {
          this.#counters.failed += 1;
        }
        continue;
      }

      this.#processedToggles.add(candidate.element);
      const wasCollapsed = this.toggles.isCollapsed(candidate.element);
      try {
        if (wasCollapsed) await this.toggles.expand(candidate.element);
        await this.#scan(candidate.element);
      } catch {
        this.#counters.failed += 1;
      } finally {
        if (wasCollapsed) {
          try {
            await this.toggles.collapse(candidate.element);
          } catch {
            this.#counters.failed += 1;
          }
        }
      }
    }
  }
}

import type { EquationMatch } from "./equations";

export interface EquationDriver {
  convert(node: Text, match: EquationMatch): Promise<"converted" | "skipped">;
}

const TIMING = {
  focus: 60,
  quick: 30,
  dialog: 140,
  mathBlock: 180,
  postConvert: 320,
} as const;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function findEditableParent(node: Text): HTMLElement | null {
  let parent = node.parentElement;
  while (parent && parent.getAttribute("data-content-editable-leaf") !== "true") {
    parent = parent.parentElement;
  }
  return parent?.closest(".notion-code-block") ? null : parent;
}

function selectMatch(node: Text, match: EquationMatch): boolean {
  const selection = window.getSelection();
  if (!selection) return false;

  const range = document.createRange();
  range.setStart(node, match.start);
  range.setEnd(node, match.end);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection.toString() === match.raw;
}

function dispatchKey(key: "Enter" | "Escape"): void {
  const target = document.activeElement;
  if (!target) return;
  const keyCode = key === "Enter" ? 13 : 27;
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      code: key,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    }),
  );
}

function isEditable(element: Element | null): element is HTMLElement {
  return Boolean(
    element &&
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        (element instanceof HTMLElement && element.isContentEditable)),
  );
}

function insertText(element: HTMLElement, value: string): boolean {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
    return true;
  }
  return document.execCommand("insertText", false, value);
}

function clickDoneButton(): boolean {
  const button = Array.from(document.querySelectorAll<HTMLElement>('[role="button"]')).find(
    (candidate) => candidate.textContent?.trim() === "Done",
  );
  button?.click();
  return Boolean(button);
}

async function convertInline(match: EquationMatch): Promise<void> {
  if (!document.execCommand("insertText", false, `$$${match.latex}$$`)) {
    throw new Error("Notion rejected inline equation insertion.");
  }
  await delay(TIMING.postConvert);
}

async function convertDisplay(match: EquationMatch): Promise<void> {
  const selection = window.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) {
    throw new Error("Equation selection was lost.");
  }

  selection.deleteFromDocument();
  await delay(TIMING.focus);
  if (!document.execCommand("insertText", false, "/math")) {
    throw new Error("Notion rejected the math command.");
  }

  await delay(TIMING.dialog);
  dispatchKey("Enter");
  await delay(TIMING.mathBlock);

  if (!isEditable(document.activeElement) || !insertText(document.activeElement, match.latex)) {
    throw new Error("Notion math input was not available.");
  }

  await delay(TIMING.dialog);
  if (document.querySelector('[role="alert"]')) {
    dispatchKey("Escape");
    throw new Error("Notion rejected the equation syntax.");
  }

  if (!clickDoneButton()) dispatchKey("Escape");
  await delay(TIMING.postConvert);
}

export class NotionEquationDriver implements EquationDriver {
  async convert(node: Text, match: EquationMatch): Promise<"converted" | "skipped"> {
    if (!node.isConnected || node.nodeValue?.slice(match.start, match.end) !== match.raw) {
      return "skipped";
    }

    const editable = findEditableParent(node);
    if (!editable) return "skipped";
    editable.click();
    await delay(TIMING.focus);

    if (!selectMatch(node, match)) return "skipped";
    await delay(TIMING.quick);

    if (match.kind === "display") await convertDisplay(match);
    else await convertInline(match);
    return "converted";
  }
}

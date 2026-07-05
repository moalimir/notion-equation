import { findNextEquation, type EquationMatch } from "./equations";

const EXCLUDED_SELECTOR = [
  ".notion-code-block",
  ".notion-equation-block",
  ".notion-text-equation-token",
  ".katex",
  "code",
  "pre",
].join(",");

export interface EquationCandidate {
  type: "equation";
  node: Text;
  match: EquationMatch;
  top: number;
  left: number;
}

export interface ToggleCandidate {
  type: "toggle";
  element: HTMLElement;
  top: number;
  left: number;
}

export type ConversionCandidate = EquationCandidate | ToggleCandidate;
export type AttemptedEquations = WeakMap<Text, Set<string>>;

function matchKey(match: EquationMatch): string {
  return `${match.start}:${match.raw}`;
}

export function markEquationAttempted(
  attempts: AttemptedEquations,
  node: Text,
  match: EquationMatch,
): void {
  const existing = attempts.get(node) ?? new Set<string>();
  existing.add(matchKey(match));
  attempts.set(node, existing);
}

function nextUnattemptedMatch(
  node: Text,
  attempts: AttemptedEquations,
): EquationMatch | null {
  const value = node.nodeValue ?? "";
  const attempted = attempts.get(node);
  let cursor = 0;

  while (cursor < value.length) {
    const match = findNextEquation(value, cursor);
    if (!match) return null;
    if (!attempted?.has(matchKey(match))) return match;
    cursor = match.end;
  }

  return null;
}

function isExcluded(node: Text): boolean {
  return node.parentElement?.closest(EXCLUDED_SELECTOR) !== null;
}

function coordinates(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;
  return {
    top: rect.top + (view?.scrollY ?? 0),
    left: rect.left + (view?.scrollX ?? 0),
  };
}

export function findEquationCandidates(
  root: ParentNode,
  attempts: AttemptedEquations,
): EquationCandidate[] {
  const document = root instanceof Document ? root : root.ownerDocument;
  if (!document) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const candidates: EquationCandidate[] = [];
  let current: Node | null;

  while ((current = walker.nextNode())) {
    const node = current as Text;
    if (!node.nodeValue?.includes("$") || isExcluded(node) || !node.parentElement) {
      continue;
    }

    const match = nextUnattemptedMatch(node, attempts);
    if (!match) continue;
    candidates.push({
      type: "equation",
      node,
      match,
      ...coordinates(node.parentElement),
    });
  }

  return candidates;
}

export function findFoldedToggles(
  root: ParentNode,
  processed: WeakSet<HTMLElement>,
): ToggleCandidate[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".notion-toggle-block"))
    .filter((toggle) => {
      const button = toggle.querySelector<HTMLElement>('[role="button"]');
      return (
        !processed.has(toggle) && button?.getAttribute("aria-expanded") === "false"
      );
    })
    .map((element) => ({ type: "toggle" as const, element, ...coordinates(element) }));
}

function compareCandidates(a: ConversionCandidate, b: ConversionCandidate): number {
  if (a.type === "equation" && b.type === "toggle" && b.element.contains(a.node)) {
    return -1;
  }
  if (a.type === "toggle" && b.type === "equation" && a.element.contains(b.node)) {
    return 1;
  }
  return a.top - b.top || a.left - b.left;
}

export function findNextCandidate(
  root: ParentNode,
  attempts: AttemptedEquations,
  processedToggles: WeakSet<HTMLElement>,
): ConversionCandidate | null {
  const candidates: ConversionCandidate[] = [
    ...findEquationCandidates(root, attempts),
    ...findFoldedToggles(root, processedToggles),
  ];
  candidates.sort(compareCandidates);
  return candidates[0] ?? null;
}

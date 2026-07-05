export type EquationKind = "inline" | "display";

export interface EquationMatch {
  kind: EquationKind;
  raw: string;
  latex: string;
  start: number;
  end: number;
}

function isEscaped(value: string, index: number): boolean {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
    slashes += 1;
  }
  return slashes % 2 === 1;
}

function findClosingDelimiter(
  value: string,
  from: number,
  delimiter: "$" | "$$",
): number {
  for (let cursor = from; cursor < value.length; cursor += 1) {
    if (delimiter === "$" && value[cursor] === "\n") return -1;
    if (!value.startsWith(delimiter, cursor) || isEscaped(value, cursor)) continue;

    if (delimiter === "$" && value[cursor + 1] === "$") {
      cursor += 1;
      continue;
    }

    return cursor;
  }
  return -1;
}

export function findNextEquation(value: string, from = 0): EquationMatch | null {
  for (let cursor = Math.max(0, from); cursor < value.length; cursor += 1) {
    if (value[cursor] !== "$" || isEscaped(value, cursor)) continue;

    const isDisplay = value[cursor + 1] === "$";
    const delimiter = isDisplay ? "$$" : "$";
    const contentStart = cursor + delimiter.length;
    const contentEnd = findClosingDelimiter(value, contentStart, delimiter);

    if (contentEnd === -1) {
      if (isDisplay) cursor += 1;
      continue;
    }

    const rawLatex = value.slice(contentStart, contentEnd);
    const latex = isDisplay ? rawLatex.trim() : rawLatex;
    if (latex.trim().length === 0) {
      cursor = contentEnd + delimiter.length - 1;
      continue;
    }

    return {
      kind: isDisplay ? "display" : "inline",
      raw: value.slice(cursor, contentEnd + delimiter.length),
      latex,
      start: cursor,
      end: contentEnd + delimiter.length,
    };
  }

  return null;
}

export function findEquations(value: string): EquationMatch[] {
  const matches: EquationMatch[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const match = findNextEquation(value, cursor);
    if (!match) break;
    matches.push(match);
    cursor = match.end;
  }

  return matches;
}

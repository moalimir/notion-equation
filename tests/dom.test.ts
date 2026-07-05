// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  findEquationCandidates,
  findNextCandidate,
  markEquationAttempted,
} from "../src/content/dom";

describe("DOM discovery", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("ignores code and existing equation blocks", () => {
    document.body.innerHTML = `
      <div data-content-editable-leaf="true">Use $x$</div>
      <pre>$code$</pre>
      <div class="katex">$rendered$</div>
    `;
    const candidates = findEquationCandidates(document.body, new WeakMap());
    expect(candidates.map((candidate) => candidate.match.raw)).toEqual(["$x$"]);
  });

  it("does not return an attempted unchanged equation again", () => {
    document.body.innerHTML = '<div data-content-editable-leaf="true">$x$ and $y$</div>';
    const attempts = new WeakMap();
    const first = findEquationCandidates(document.body, attempts)[0];
    expect(first).toBeDefined();
    markEquationAttempted(attempts, first!.node, first!.match);
    expect(findEquationCandidates(document.body, attempts)[0]?.match.raw).toBe("$y$");
  });

  it("processes a toggle title before expanding its folded content", () => {
    document.body.innerHTML = `
      <div class="notion-toggle-block">
        <div role="button" aria-expanded="false"></div>
        <div data-content-editable-leaf="true">Title $x$</div>
      </div>
    `;
    const next = findNextCandidate(document.body, new WeakMap(), new WeakSet());
    expect(next?.type).toBe("equation");
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findEquations, findNextEquation } from "../src/content/equations";

describe("equation parsing", () => {
  it("finds inline and display equations with their positions", () => {
    assert.deepEqual(findEquations("A $x + 1$ then $$ y^2 $$ end"), [
      { kind: "inline", raw: "$x + 1$", latex: "x + 1", start: 2, end: 9 },
      { kind: "display", raw: "$$ y^2 $$", latex: "y^2", start: 15, end: 24 },
    ]);
  });

  it("supports multiline display equations", () => {
    assert.equal(findNextEquation("$$a +\nb$$")?.latex, "a +\nb");
  });

  it("ignores escaped dollars, empty pairs, and malformed input", () => {
    assert.deepEqual(findEquations(String.raw`Price \$5, empty $$   $$, broken $x`), []);
  });

  it("continues after an escaped delimiter", () => {
    assert.equal(findNextEquation(String.raw`\$skip and $keep$`)?.latex, "keep");
  });
});

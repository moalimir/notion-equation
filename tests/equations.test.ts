import { describe, expect, it } from "vitest";
import { findEquations, findNextEquation } from "../src/content/equations";

describe("equation parsing", () => {
  it("finds inline and display equations with their positions", () => {
    expect(findEquations("A $x + 1$ then $$ y^2 $$ end")).toEqual([
      { kind: "inline", raw: "$x + 1$", latex: "x + 1", start: 2, end: 9 },
      { kind: "display", raw: "$$ y^2 $$", latex: "y^2", start: 15, end: 24 },
    ]);
  });

  it("supports multiline display equations", () => {
    expect(findNextEquation("$$a +\nb$$")?.latex).toBe("a +\nb");
  });

  it("ignores escaped dollars, empty pairs, and malformed input", () => {
    expect(findEquations(String.raw`Price \$5, empty $$   $$, broken $x`)).toEqual([]);
  });

  it("continues after an escaped delimiter", () => {
    expect(findNextEquation(String.raw`\$skip and $keep$`)?.latex).toBe("keep");
  });
});

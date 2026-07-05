// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { ConversionEngine } from "../src/content/engine";
import type { EquationMatch } from "../src/content/equations";
import type { EquationDriver } from "../src/content/notion-driver";
import type { ToggleController } from "../src/content/toggles";

class ReplacingDriver implements EquationDriver {
  async convert(node: Text, match: EquationMatch): Promise<"converted"> {
    node.nodeValue = `${node.nodeValue?.slice(0, match.start)}[math]${node.nodeValue?.slice(match.end)}`;
    return "converted";
  }
}

class FakeToggleController implements ToggleController {
  expansions = 0;
  collapses = 0;

  isCollapsed(toggle: HTMLElement): boolean {
    return toggle.querySelector('[role="button"]')?.getAttribute("aria-expanded") === "false";
  }

  async expand(toggle: HTMLElement): Promise<void> {
    this.expansions += 1;
    toggle.querySelector('[role="button"]')?.setAttribute("aria-expanded", "true");
    const content = document.createElement("div");
    content.dataset.contentEditableLeaf = "true";
    content.textContent = "Inside $y$";
    toggle.append(content);
  }

  async collapse(toggle: HTMLElement): Promise<void> {
    this.collapses += 1;
    toggle.querySelector('[role="button"]')?.setAttribute("aria-expanded", "false");
  }
}

describe("conversion engine", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("converts multiple equations and reports counts", async () => {
    document.body.innerHTML = '<div data-content-editable-leaf="true">$x$ then $$y$$</div>';
    const result = await new ConversionEngine(
      new ReplacingDriver(),
      new FakeToggleController(),
    ).run(document.body);
    expect(result).toMatchObject({ status: "completed", converted: 2, failed: 0 });
    expect(document.body.textContent).toBe("[math] then [math]");
  });

  it("restores a folded toggle after converting its rendered content", async () => {
    document.body.innerHTML = `
      <div class="notion-toggle-block">
        <div role="button" aria-expanded="false"></div>
      </div>
    `;
    const toggles = new FakeToggleController();
    const result = await new ConversionEngine(new ReplacingDriver(), toggles).run(document.body);
    expect(result.converted).toBe(1);
    expect(toggles.expansions).toBe(1);
    expect(toggles.collapses).toBe(1);
    expect(toggles.isCollapsed(document.querySelector(".notion-toggle-block")!)).toBe(true);
  });

  it("attempts a failing equation once instead of looping", async () => {
    document.body.innerHTML = '<div data-content-editable-leaf="true">$x$</div>';
    const driver: EquationDriver = {
      convert: async () => {
        throw new Error("test failure");
      },
    };
    const result = await new ConversionEngine(driver, new FakeToggleController()).run(
      document.body,
    );
    expect(result).toMatchObject({ converted: 0, failed: 1 });
  });

  it("restores a folded toggle when conversion inside it fails", async () => {
    document.body.innerHTML = `
      <div class="notion-toggle-block">
        <div role="button" aria-expanded="false"></div>
      </div>
    `;
    const toggles = new FakeToggleController();
    const driver: EquationDriver = {
      convert: async () => {
        throw new Error("test failure");
      },
    };
    const result = await new ConversionEngine(driver, toggles).run(document.body);
    expect(result.failed).toBe(1);
    expect(toggles.collapses).toBe(1);
    expect(toggles.isCollapsed(document.querySelector(".notion-toggle-block")!)).toBe(true);
  });

  it("stops at the configured operation limit", async () => {
    document.body.innerHTML = '<div data-content-editable-leaf="true">$a$ $b$</div>';
    const result = await new ConversionEngine(
      new ReplacingDriver(),
      new FakeToggleController(),
      1,
    ).run(document.body);
    expect(result).toMatchObject({ converted: 1, failed: 1 });
    expect(result.message).toContain("safety limit");
  });
});

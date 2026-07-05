export interface ToggleController {
  isCollapsed(toggle: HTMLElement): boolean;
  expand(toggle: HTMLElement): Promise<void>;
  collapse(toggle: HTMLElement): Promise<void>;
}

const TOGGLE_RENDER_TIMEOUT = 800;

function toggleButton(toggle: HTMLElement): HTMLElement | null {
  return toggle.querySelector<HTMLElement>('[role="button"]');
}

function waitForRender(toggle: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (toggle.querySelector(".notion-selectable")) finish();
    });
    const timer = window.setTimeout(finish, TOGGLE_RENDER_TIMEOUT);

    function finish(): void {
      observer.disconnect();
      window.clearTimeout(timer);
      resolve();
    }

    observer.observe(toggle, { childList: true, subtree: true });
    if (toggle.querySelector(".notion-selectable")) finish();
  });
}

export class NotionToggleController implements ToggleController {
  isCollapsed(toggle: HTMLElement): boolean {
    return toggleButton(toggle)?.getAttribute("aria-expanded") === "false";
  }

  async expand(toggle: HTMLElement): Promise<void> {
    const button = toggleButton(toggle);
    if (!button) throw new Error("Toggle control was not found.");
    if (!this.isCollapsed(toggle)) return;

    button.click();
    if (button.getAttribute("aria-expanded") === "false") {
      throw new Error("Toggle did not expand.");
    }
    await waitForRender(toggle);
  }

  async collapse(toggle: HTMLElement): Promise<void> {
    const button = toggleButton(toggle);
    if (!button || this.isCollapsed(toggle)) return;
    button.click();
  }
}

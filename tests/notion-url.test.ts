import { describe, expect, it } from "vitest";
import { isSupportedNotionUrl } from "../src/shared/notion-url";

describe("Notion URL matching", () => {
  it.each([
    "https://www.notion.so/workspace/page",
    "https://notion.so/page",
    "https://team.notion.com/page",
  ])("accepts %s", (url) => expect(isSupportedNotionUrl(url)).toBe(true));

  it.each([
    "http://www.notion.so/page",
    "https://notion.so.example.com/page",
    "chrome://extensions",
    undefined,
  ])("rejects %s", (url) => expect(isSupportedNotionUrl(url)).toBe(false));
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSupportedNotionUrl } from "../src/shared/notion-url";

describe("Notion URL matching", () => {
  for (const url of [
    "https://www.notion.so/workspace/page",
    "https://notion.so/page",
    "https://team.notion.com/page",
  ]) {
    it(`accepts ${url}`, () => assert.equal(isSupportedNotionUrl(url), true));
  }

  for (const url of [
    "http://www.notion.so/page",
    "https://notion.so.example.com/page",
    "chrome://extensions",
    undefined,
  ]) {
    it(`rejects ${String(url)}`, () => assert.equal(isSupportedNotionUrl(url), false));
  }
});

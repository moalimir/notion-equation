# Chrome Web Store Listing

## Product details

**Title:** Notion Equation

**Summary:** Convert LaTeX-style text into native inline and display equations in Notion.

**Category:** Productivity

**Language:** English

## Detailed description

Notion Equation turns LaTeX-style text into Notion's native math elements on demand.

Paste notes containing `$inline equations$` or `$$display equations$$`, then click the extension button or use the keyboard shortcut. The extension processes equations across the active page, including content inside folded toggle blocks, and reports the result when it finishes.

Key features:

- Inline and display equation conversion
- Multiple equations in one run
- Folded toggle support
- Code-block and existing-equation protection
- No accounts, analytics, tracking, or network requests
- Access limited to the active tab after an explicit user action

Keyboard shortcut: `Ctrl+Shift+M` on Windows, Linux, and ChromeOS; `Command+Shift+M` on macOS. Shortcuts can be changed at `chrome://extensions/shortcuts`.

Notion Equation is an independent extension and is not affiliated with Notion Labs, Inc.

Based on Noeqtion by voidCounter/Rohit: https://github.com/voidCounter/noeqtion

## URLs

- Homepage: https://github.com/moalimir/notion-equation
- Support: https://github.com/moalimir/notion-equation/issues
- Privacy policy: publish `PRIVACY.md` at a stable public URL before submission

## Privacy practices

**Single purpose:** Convert LaTeX-style text on the active Notion page into Notion's native inline and display equations when requested by the user.

**`activeTab` justification:** Provides temporary access to the current Notion tab only after the user clicks the extension or invokes its shortcut. It avoids persistent access to browsing activity.

**`scripting` justification:** Injects the extension's packaged conversion logic into the user-invoked tab. No remote code is downloaded or executed.

**Data use disclosures:** Select no data collection categories. The extension processes page text locally and does not collect, retain, or transmit it.

**Remote code:** No.

**In-app purchases:** No.

# Chrome Web Store Publishing Checklist

## Build verification

- [ ] Run `npm ci` with Node.js 20 or newer.
- [ ] Run `npm run package`.
- [ ] Confirm the generated ZIP is `release/notion-equation-1.0.0.zip`.
- [ ] Load `dist/` through `chrome://extensions` and complete the Notion smoke tests below.

## Smoke tests

- [ ] On one disposable Notion page, add inline and display equations, a folded toggle equation, and a code-block equation; run the popup once and confirm only the supported page content converts.
- [ ] Run it again and confirm the popup reports that no equations remain.
- [ ] Invoke the keyboard shortcut once and confirm Chrome shows the running badge, then opens the popup with the conversion result.

## Store dashboard

- [ ] Register or verify the Chrome Web Store developer account.
- [ ] Create a new item and upload the release ZIP.
- [ ] Copy product and privacy fields from `LISTING.md`.
- [ ] Set category to Productivity and language to English.
- [ ] Upload `assets/store-icon-128.png` as the 128×128 Store icon.
- [ ] Upload `assets/promo-440x280.jpg` as the small promotional tile.
- [ ] Upload the three `assets/screenshot-*.jpg` files as 1280×800 screenshots.
- [ ] Upload `assets/marquee-1400x560.jpg` as the marquee promotional tile.
- [ ] Host `PRIVACY.md` at a stable public URL and enter that URL.
- [ ] Enter the homepage and support URLs from `LISTING.md`.
- [ ] Declare no data collection, no remote code, and no in-app purchases.
- [ ] Review all metadata against version 1.0.0, then submit for review.

Do not upload source files, tests, `node_modules`, or the repository root. Upload only the generated ZIP.

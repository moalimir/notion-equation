# Notion Equation

[Notion Equation](https://chromewebstore.google.com/detail/notion-equation/klnokpbojhaehabdfmhegenjijmpenmn) converts LaTeX-style text into Notion's native inline and display equations. It runs only when you press the extension button or its keyboard shortcut.

## Demo

https://github.com/user-attachments/assets/f872b9ef-1ce1-4ce5-bc26-92bc96a0a116

Original demo recorded by [voidCounter/Rohit](https://github.com/voidCounter) for [Noeqtion](https://github.com/voidCounter/noeqtion).

## Features

- Converts `$inline equations$` and `$$display equations$$` across the current page.
- Processes multiple equations and equations inside folded toggle blocks.
- Skips code blocks, existing equation blocks, escaped dollar signs, and malformed delimiters.
- Reports successful, partial, empty, busy, unsupported-page, and failed runs.
- Opens the result popup after a keyboard-shortcut conversion finishes.
- Requests access to the current tab only after an explicit user action.

## Development

Requires Node.js 20 or newer.

```sh
npm install
npm run check
```

Useful commands:

```sh
npm run dev       # rebuild source files while they change
npm run build     # create the unpacked extension in dist/
npm run test      # run unit tests
npm run package   # verify and create the Chrome Web Store ZIP
```

To test the unpacked extension:

1. Run `npm run build`.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode and choose **Load unpacked**.
4. Select the generated `dist` directory.
5. Open an editable Notion page and select **Convert equations**, or press `Ctrl+Shift+9` (`Command+Shift+9` on macOS).


The extension does not collect, store, or transmit user data. See [PRIVACY.md](PRIVACY.md).

## Attribution

This project is based on [Noeqtion](https://github.com/voidCounter/noeqtion), originally created by [voidCounter/Rohit](https://github.com/voidCounter). The original project and contributors remain credited in Git history and [NOTICE.md](NOTICE.md).

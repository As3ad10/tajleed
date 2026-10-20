# تجليد · Tajleed

Arabic-first browser workspace for dimensioned paperback, hardcover case, and dust-jacket templates. It uses SvelteKit, Svelte, and TypeScript. The approved product scope is in [PRODUCT.md](PRODUCT.md); the brand system is in [DESIGN.md](DESIGN.md).

## Run locally

Node.js 24.13.1 and npm 11.8.0 are the project baseline. Run npm ci, then npm run dev. The workspace opens at the root route.

`npm run build` prerenders the browser-only app into `dist/`. The Sites deployment reads that directory through `.openai/hosting.json`.

New projects begin with editable A5 board or trim dimensions, 3 mm bleed, and 5 mm safe margins on each side. Enter the printer's spine and structural measurements before exporting. You can add a printer slug outside the bleed with its own height and text. Press **حفظ المشروع** to store changes in IndexedDB; the app warns before discarding unsaved work. Press **مشروع جديد** in the header to start a fresh cover. Use **مشاريعي** to duplicate, reopen, or delete saved projects; download a .tajleed.json file for backup and transfer. Older version 1 project files are migrated when imported.

Use the Undo and Redo buttons beside Save to step through edits in the current project. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z or Ctrl+Y redoes. Consecutive typing in one field is one step. History holds up to 100 steps during the current session and resets when you switch projects or reload.

Use the header language button to switch between Arabic and English. This changes the interface and template labels, independently of book opening direction. The language preference is stored on this device.

The workspace follows the device's light or dark appearance until you choose a theme from the header. The chosen theme is stored locally and does not affect exported templates.

## Measurements and files

The geometry engine in src/lib/cover uses millimetres and drives preview, validation, SVG, and PDF. Paperback spine estimation is based on pages, sheet thickness, and printer adjustment. Hardcover cases and jackets need printer-supplied structural values.

Exports are reference templates with physical SVG/PDF dimensions, trim and bleed boundaries, optional guides and printer marks, and outlined Arabic or English annotations from the supplied OTF. The optional printer slug extends the media size while retaining the original trim and bleed bounds. An optional ISBN-13 barcode is placed on the back panel. Exports are not PDF/X certified or completed artwork.

## Verify

Run npm run check, npm run build, and npm test. For browser workflows, install Chromium with npx playwright install chromium, then run npm run test:browser. Playwright captures desktop and mobile screenshots. If browser downloads are restricted, set PLAYWRIGHT_BROWSERS_PATH to a writable directory before installing and running tests.

## Stack

pdf-lib makes vector PDF documents, bwip-js produces SVG barcode bars, fontkit outlines Arabic labels, idb stores local projects, and Zod checks transferred project files. Export libraries load only when the corresponding document is requested. There is no server database or account flow.

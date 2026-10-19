# Tajleed — product decisions

Tajleed is an Arabic-first browser workspace for designers and print shops to create dimensioned book-cover **templates**. The first release opens directly into the workspace and supports paperback covers, hardcover cases, and dust jackets. It has no accounts, cloud storage, artwork upload, freeform design editor, or Adobe integration.

## Approved workflow

- A project has a name, construction type, book opening direction, measurements, print guides, and optional ISBN-13 barcode.
- Arabic is the first interface language, with an English switch in the header. The interface language is stored on the device and stays independent of book opening direction. New books open in the Arabic direction: the front cover appears to the left of the spine in the outside spread.
- New projects begin with editable A5 dimensions (148 × 210 mm), 3 mm bleed, and 5 mm safety margins on each of the four physical sides. They need a valid spine value before document export.
- Users can preview, zoom, pan, fit the page, and toggle screen guides. Document measurements do not depend on zoom.
- Users save projects explicitly with the header button. Unsaved changes remain in memory and trigger a warning before switching projects or leaving the page. A successful save stores the project in IndexedDB. Users can create, rename, duplicate, reopen, and delete with confirmation, and transfer a versioned `.tajleed.json` backup. Version 1 projects are migrated on opening or import.
- The workspace offers light and dark appearances. It follows the device setting until the user chooses a mode, then remembers that choice locally. Workspace appearance does not alter template geometry or exports.

## Measurement and output rules

- A shared millimetre geometry model drives validation, preview, SVG, and PDF. Only displayed values are rounded.
- Paperbacks have trim size, spine, bleed, independent top/right/bottom/left safe margins, and optional separate front/back flap widths. Spine can be entered manually or calculated from `(pages ÷ 2) × sheet thickness + printer adjustment`. Pages and sheets are distinct; GSM does not imply sheet thickness.
- Hardcovers have board dimensions, case spine, hinges, turn-ins, bleed, and four safety margins. Board and fold lines are guides; the outer cut includes turn-ins. Dust jackets have their own independent panel, spine, flap, bleed, and safety measurements. Printers supply structural values; there is no universal binding formula.
- Every construction can add an optional printer slug below and outside the bleed boundary. Its height and information text are editable. It enlarges the document media size without changing trim or bleed dimensions.
- SVG and vector PDF exports have exact physical sizes. Guides and measurements are included by default and can be explicitly excluded. Optional printer marks are separate. Arabic or English annotations and printer slug text are outlined using the supplied OTF font. Outputs are templates, with no PDF/X or artwork-readiness claim.
- An optional ISBN-13 barcode needs a valid book prefix and checksum, numeric placement on the back, quiet zones, and an unmirrored orientation. An invalid enabled barcode blocks export.

## Technical scope

SvelteKit, Svelte, and TypeScript remain the framework. There is no backend API. `pdf-lib`, `bwip-js`, `fontkit`, `idb`, and Zod support output, barcode, local persistence, and project-file validation. Vitest and Playwright verify calculations and workflows. The visual identity in `DESIGN.md` is approved and remains authoritative.

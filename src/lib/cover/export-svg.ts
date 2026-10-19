import bwipjs from 'bwip-js/browser';
import { calculateGeometry } from './geometry';
import { normalizeIsbn } from './isbn';
import { loadOutlineFont, outlineLabel } from './outline';
import { barcodeSvg, labelsFor, svgMarkup } from './render';
import { validateProject } from './validation';
import type { CoverProject } from './types';

export async function exportSvg(project: CoverProject, fontBytes?: Uint8Array): Promise<string> {
  const issues=validateProject(project);
  if (issues.length) throw new Error(issues[0].message);
  const g=calculateGeometry(project);
  const font=project.exportOptions.measurements ? await loadOutlineFont(fontBytes) : undefined;
  const labelMarkup=font ? labelsFor(project,g).map(label=>outlineLabel(font,label).svg).join('') : '';
  let barcodeMarkup='';
  if (g.barcode) {
    const bars=bwipjs.toSVG({bcid:'ean13',text:normalizeIsbn(project.barcode.isbn),includetext:false});
    barcodeMarkup=barcodeSvg(g.barcode,bars);
  }
  return svgMarkup(project,{labelMarkup,barcodeMarkup});
}

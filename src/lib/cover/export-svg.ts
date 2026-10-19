import bwipjs from 'bwip-js/browser';
import { calculateGeometry } from './geometry';
import { normalizeIsbn } from './isbn';
import { loadOutlineFont, outlineLabel } from './outline';
import { barcodeSvg, labelsFor, slugLabelFor, svgMarkup } from './render';
import { validateProject } from './validation';
import type { CoverProject } from './types';
import type { Language } from '../i18n/messages';

export async function exportSvg(project: CoverProject, fontBytes?: Uint8Array, language:Language='ar'): Promise<string> {
  const issues=validateProject(project,language);
  if (issues.length) throw new Error(issues[0].message);
  const g=calculateGeometry(project);
  const font=project.exportOptions.measurements || g.slug ? await loadOutlineFont(fontBytes,language) : undefined;
  const labelMarkup=font && project.exportOptions.measurements ? labelsFor(project,g,language).map(label=>outlineLabel(font,label).svg).join('') : '';
  const slugLabel=slugLabelFor(project,g,language);
  const slugMarkup=font && slugLabel ? outlineLabel(font,slugLabel).svg : '';
  let barcodeMarkup='';
  if (g.barcode) {
    const bars=bwipjs.toSVG({bcid:'ean13',text:normalizeIsbn(project.barcode.isbn),includetext:false});
    barcodeMarkup=barcodeSvg(g.barcode,bars);
  }
  return svgMarkup(project,{labelMarkup,barcodeMarkup,slugMarkup,language});
}

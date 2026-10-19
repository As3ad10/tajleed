import { calculateGeometry, effectiveSpine } from './geometry';
import { formatMm } from './numbers';
import type { CoverGeometry, CoverProject, Panel, Rect } from './types';
import { messages, type Language } from '../i18n/messages';

const panelName = (key:Panel['key'], language:Language) => messages[language][({front:'front',back:'back',spine:'spinePanel',frontFlap:'frontFlapPanel',backFlap:'backFlapPanel',frontHinge:'frontHingePanel',backHinge:'backHingePanel'} as const)[key]];
const esc = (s: string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const n = (value:number) => Number(value.toFixed(5)).toString();
export interface Label { text: string; x: number; y: number; size: number; align: 'center' | 'start'; direction: 'rtl' | 'ltr' }
export function labelsFor(project: CoverProject, g: CoverGeometry, language:Language='ar'): Label[] {
  const labels: Label[] = [];
  for (const panel of g.panels) {
    if (panel.rect.width < 10) continue;
    labels.push({text:panelName(panel.key,language),x:panel.rect.x+panel.rect.width/2,y:panel.rect.y+panel.rect.height/2,size:Math.min(4,Math.max(2.4,panel.rect.width/22)),align:'center',direction:language==='ar'?'rtl':'ltr'});
  }
  labels.push({text:`${formatMm(g.width,'en-US')} × ${formatMm(g.height,'en-US')} ${messages[language].exportUnit}`,x:g.width/2,y:project.spec.bleed+9,size:2.5,align:'center',direction:'ltr'});
  labels.push({text:`${formatMm(effectiveSpine(project),'en-US')} ${messages[language].exportUnit}`,x:g.width/2,y:g.bleedBounds.height-project.spec.bleed-6,size:2.4,align:'center',direction:'ltr'});
  return labels;
}
export function slugLabelFor(project:CoverProject,g:CoverGeometry,language:Language='ar'):Label | undefined {
  if (!g.slug) return undefined;
  const text=project.slug.text.trim() || project.name;
  return {text,x:g.width/2,y:g.slug.y+g.slug.height/2+0.8,size:Math.min(2.6,Math.max(1.5,(g.width-12)/(Math.max(text.length,1)*0.8))),align:'center',direction:language==='ar'?'rtl':'ltr'};
}
export function barcodeSvg(box: Rect, svg: string): string {
  // bwip-js supplies the vector EAN-13 bars; the surrounding white rectangle preserves quiet zones.
  const inner = box.width - 6;
  const bars = box.height - 2;
  const pathTags = svg.match(/<path\b[^>]*\/>/g)?.join('') ?? '';
  return `<g id="barcode"><rect x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}" fill="#fff"/><g transform="translate(${n(box.x+3)} ${n(box.y+1)}) scale(${n(inner/190)} ${n(bars/145)})">${pathTags}</g></g>`;
}
export function svgMarkup(project: CoverProject, options: { preview?: boolean; labelMarkup?: string; barcodeMarkup?: string; slugMarkup?: string; language?: Language } = {}): string {
  const g = calculateGeometry(project);
  const {guides,measurements,marks} = project.exportOptions;
  const preview = options.preview ?? false;
  const language=options.language ?? 'ar';
  const showGuides = guides;
  const color = '#573E41';
  const panels = g.panels.map((p) => `<g id="panel-${p.key}"><rect x="${n(p.rect.x)}" y="${n(p.rect.y)}" width="${n(p.rect.width)}" height="${n(p.rect.height)}" fill="${preview ? (p.key==='front'?'#fae8df':p.key==='back'?'#f5f0e9':'#fcf6da') : 'none'}" stroke="none"/></g>`).join('');
  const guidesMarkup = showGuides ? `<g id="guides" fill="none">${g.lines.map(l=>`<line x1="${n(l.x1)}" y1="${n(l.y1)}" x2="${n(l.x2)}" y2="${n(l.y2)}" stroke="${l.kind==='trim'?'#d97b7e':'#8a7777'}" stroke-width="${l.kind==='trim'?'0.32':'0.23'}" stroke-dasharray="${l.kind==='trim'?'none':'1.5 1.2'}"/>`).join('')}${g.panels.filter(p=>p.safe).map(p=>`<rect x="${n(p.safe!.x)}" y="${n(p.safe!.y)}" width="${n(p.safe!.width)}" height="${n(p.safe!.height)}" stroke="#a29382" stroke-width="0.18" stroke-dasharray="1 1"/>`).join('')}</g>` : '';
  const textMarkup=(l:Label)=>`<text x="${n(l.x)}" y="${n(l.y)}" font-size="${n(l.size)}" fill="${color}" text-anchor="${l.align==='center'?'middle':'start'}" direction="${l.direction}" font-family="Thmanyah Sans, sans-serif">${esc(l.text)}</text>`;
  const labelMarkup = options.labelMarkup ?? labelsFor(project,g,language).map(textMarkup).join('');
  const annotations = (preview || measurements) ? `<g id="annotations">${labelMarkup}</g>` : '';
  const slugLabel=slugLabelFor(project,g,language);
  const slugMarkup=g.slug ? `<g id="printer-slug"><rect x="0" y="${n(g.slug.y)}" width="${n(g.slug.width)}" height="${n(g.slug.height)}" fill="none" stroke="${color}" stroke-width="0.25"/>${options.slugMarkup ?? (slugLabel ? textMarkup(slugLabel) : '')}</g>` : '';
  const markSegments = [
    [g.cut.x,0,g.cut.x,g.cut.y-0.6],[g.cut.x+g.cut.width,0,g.cut.x+g.cut.width,g.cut.y-0.6],
    [g.cut.x,g.bleedBounds.height,g.cut.x,g.cut.y+g.cut.height+0.6],[g.cut.x+g.cut.width,g.bleedBounds.height,g.cut.x+g.cut.width,g.cut.y+g.cut.height+0.6],
    [0,g.cut.y,g.cut.x-0.6,g.cut.y],[0,g.cut.y+g.cut.height,g.cut.x-0.6,g.cut.y+g.cut.height],
    [g.width,g.cut.y,g.cut.x+g.cut.width+0.6,g.cut.y],[g.width,g.cut.y+g.cut.height,g.cut.x+g.cut.width+0.6,g.cut.y+g.cut.height]
  ];
  const marksMarkup = !preview && marks ? `<g id="printer-marks" stroke="${color}" stroke-width="0.2">${markSegments.map(v=>`<line x1="${n(v[0])}" y1="${n(v[1])}" x2="${n(v[2])}" y2="${n(v[3])}"/>`).join('')}</g>` : '';
  const barcode = g.barcode ? options.barcodeMarkup ?? `<g id="barcode"><rect x="${n(g.barcode.x)}" y="${n(g.barcode.y)}" width="${n(g.barcode.width)}" height="${n(g.barcode.height)}" fill="#fff" stroke="${color}" stroke-width="0.2"/><text x="${n(g.barcode.x+g.barcode.width/2)}" y="${n(g.barcode.y+g.barcode.height/2)}" font-size="2.5" text-anchor="middle" fill="${color}">ISBN</text></g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(g.width)}mm" height="${n(g.height)}mm" viewBox="0 0 ${n(g.width)} ${n(g.height)}" role="img" aria-label="${messages[language].templateImageLabel}"><title>${messages[language].templateTitle} ${esc(project.name)}</title><rect width="${n(g.width)}" height="${n(g.height)}" fill="white"/><rect id="bleed-boundary" width="${n(g.bleedBounds.width)}" height="${n(g.bleedBounds.height)}" fill="none" stroke="${color}" stroke-width="0.3"/><g id="panels">${panels}</g><rect id="trim-boundary" x="${n(g.cut.x)}" y="${n(g.cut.y)}" width="${n(g.cut.width)}" height="${n(g.cut.height)}" fill="none" stroke="#d97b7e" stroke-width="0.35"/>${guidesMarkup}${annotations}${slugMarkup}${barcode}${marksMarkup}</svg>`;
}

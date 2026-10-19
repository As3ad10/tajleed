import { PDFDocument, rgb } from 'pdf-lib';
import { calculateGeometry } from './geometry';
import { isbn13Bits } from './isbn';
import { loadOutlineFont, outlineLabel } from './outline';
import { labelsFor } from './render';
import { mmToPt } from './numbers';
import { validateProject } from './validation';
import type { CoverProject, Rect } from './types';

const cocoa=rgb(87/255,62/255,65/255);
const coral=rgb(217/255,123/255,126/255);
const muted=rgb(0.55,0.48,0.48);
export async function exportPdf(project: CoverProject, fontBytes?: Uint8Array): Promise<Uint8Array> {
  const issues=validateProject(project);
  if (issues.length) throw new Error(issues[0].message);
  const g=calculateGeometry(project);
  const pdf=await PDFDocument.create();
  pdf.setTitle(`Tajleed template — ${project.name}`);
  pdf.setCreator('Tajleed');
  const page=pdf.addPage([mmToPt(g.width),mmToPt(g.height)]);
  page.setTrimBox(mmToPt(g.cut.x),mmToPt(g.height-g.cut.y-g.cut.height),mmToPt(g.cut.width),mmToPt(g.cut.height));
  page.setBleedBox(0,0,mmToPt(g.width),mmToPt(g.height));
  const rect=(r:Rect,color=coral,width=0.3)=>page.drawRectangle({x:mmToPt(r.x),y:mmToPt(g.height-r.y-r.height),width:mmToPt(r.width),height:mmToPt(r.height),borderColor:color,borderWidth:mmToPt(width),opacity:0,borderOpacity:1});
  rect({x:0,y:0,width:g.width,height:g.height},cocoa);
  rect(g.cut);
  if (project.exportOptions.guides) {
    for (const line of g.lines) page.drawLine({start:{x:mmToPt(line.x1),y:mmToPt(g.height-line.y1)},end:{x:mmToPt(line.x2),y:mmToPt(g.height-line.y2)},thickness:mmToPt(line.kind==='trim'?0.3:0.2),color:line.kind==='trim'?coral:muted,dashArray:line.kind==='trim'?undefined:[mmToPt(1.5),mmToPt(1)]});
    for (const panel of g.panels) if (panel.safe) rect(panel.safe,muted,0.18);
  }
  if (project.exportOptions.measurements) {
    const font=await loadOutlineFont(fontBytes);
    for (const label of labelsFor(project,g)) {
      for (const glyph of outlineLabel(font,label).glyphs) {
        page.drawSvgPath(glyph.pdfPath,{x:mmToPt(glyph.x),y:mmToPt(g.height-glyph.y),scale:mmToPt(glyph.scale),color:cocoa});
      }
    }
  }
  if (g.barcode) {
    const b=g.barcode;
    page.drawRectangle({x:mmToPt(b.x),y:mmToPt(g.height-b.y-b.height),width:mmToPt(b.width),height:mmToPt(b.height),color:rgb(1,1,1)});
    const bits=isbn13Bits(project.barcode.isbn);
    const moduleWidth=(b.width-6)/bits.length;
    for (let i=0;i<bits.length;i++) if (bits[i]==='1') page.drawRectangle({x:mmToPt(b.x+3+i*moduleWidth),y:mmToPt(g.height-b.y-b.height+1),width:mmToPt(moduleWidth),height:mmToPt(b.height-2),color:rgb(0,0,0)});
  }
  if (project.exportOptions.marks) {
    const xs=[g.cut.x,g.cut.x+g.cut.width];
    for (const x of xs) for (const [y1,y2] of [[0,g.cut.y-0.6],[g.cut.y+g.cut.height+0.6,g.height]]) page.drawLine({start:{x:mmToPt(x),y:mmToPt(g.height-y1)},end:{x:mmToPt(x),y:mmToPt(g.height-y2)},thickness:mmToPt(0.2),color:cocoa});
    const ys=[g.cut.y,g.cut.y+g.cut.height];
    for (const y of ys) for (const [x1,x2] of [[0,g.cut.x-0.6],[g.cut.x+g.cut.width+0.6,g.width]]) page.drawLine({start:{x:mmToPt(x1),y:mmToPt(g.height-y)},end:{x:mmToPt(x2),y:mmToPt(g.height-y)},thickness:mmToPt(0.2),color:cocoa});
  }
  return pdf.save();
}

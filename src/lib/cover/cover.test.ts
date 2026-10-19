import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { newProject } from './project';
import { calculateGeometry, effectiveSpine } from './geometry';
import { parseLocalizedNumber, mmToPt, ptToMm } from './numbers';
import { isValidIsbn13, isbn13Bits } from './isbn';
import { validateProject } from './validation';
import { parseProjectFile } from './schema';
import { exportSvg } from './export-svg';
import { exportPdf } from './export-pdf';
import bwipjs from 'bwip-js/browser';
import type { CoverProject } from './types';

const fontBytes=readFileSync(new URL('../../../static/fonts/thmanyahsans-Regular.otf',import.meta.url));
const valid=()=>{const p=newProject();p.spec.spine=12;return p};

describe('cover geometry',()=>{
  it('matches independent paperback and asymmetric flap fixtures',()=>{
    const p=valid();
    let g=calculateGeometry(p);
    expect([g.width,g.height]).toEqual([314,216]);
    expect(g.panels.find(p=>p.key==='front')?.rect.x).toBe(3);
    expect(g.panels.find(p=>p.key==='back')?.rect.x).toBe(163);
    if(p.spec.type==='paperback'){p.spec.frontFlap=60;p.spec.backFlap=80}
    g=calculateGeometry(p);
    expect(g.width).toBe(454);
    expect(g.panels.find(p=>p.key==='front')?.rect.x).toBe(63);
    expect(g.panels.find(p=>p.key==='back')?.rect.x).toBe(223);
    p.opening='english';
    g=calculateGeometry(p);
    expect(g.panels.find(p=>p.key==='back')?.rect.x).toBe(83);
    expect(g.panels.find(p=>p.key==='front')?.rect.x).toBe(243);
  });
  it('keeps case and jacket measurements independent',()=>{
    const c=newProject('case','hardcover');
    c.spec={type:'hardcover',width:150,height:220,spine:14,hinge:7,turnIn:18,bleed:3,safe:5};
    const cg=calculateGeometry(c);
    expect([cg.width,cg.height,cg.cut.width,cg.cut.height]).toEqual([370,262,364,256]);
    expect(cg.panels.find(p=>p.key==='front')?.rect.x).toBe(21);
    const j=newProject('jacket','jacket');
    j.spec={type:'jacket',width:148,height:210,spine:12,frontFlap:70,backFlap:75,bleed:3,safe:5};
    const jg=calculateGeometry(j);
    expect([jg.width,jg.height]).toEqual([459,216]);
    expect(jg.panels.find(p=>p.key==='front')?.rect.x).toBe(73);
  });
  it('uses pages rather than sheets and does not accumulate rounding',()=>{
    const p=valid();
    if(p.spec.type!=='paperback') throw new Error();
    p.spec.spineMode='estimate';p.spec.pages=240;p.spec.sheetThickness=0.095;p.spec.adjustment=0.4;
    expect(effectiveSpine(p)).toBeCloseTo(11.8,10);
    expect(calculateGeometry(p).width).toBeCloseTo(313.8,10);
    for(let i=0;i<100;i++){p.spec.width=148+i/100;calculateGeometry(p)}
    p.spec.width=148;
    expect(calculateGeometry(p).width).toBeCloseTo(313.8,10);
    expect(parseLocalizedNumber('١٤٨٫٥')).toBe(148.5);
    expect(ptToMm(mmToPt(459))).toBeCloseTo(459,10);
  });
});
describe('validation and transfer',()=>{
  it('rejects invalid safety, structural input and barcode placement',()=>{
    const p=valid();
    p.spec.safe=80;
    expect(validateProject(p).some(i=>i.field==='safe')).toBe(true);
    p.spec.safe=5;
    p.barcode={enabled:true,isbn:'9780306406157',x:1,y:12,width:38,height:24};
    expect(validateProject(p).some(i=>i.code==='placement')).toBe(true);
    p.barcode.x=12;
    expect(validateProject(p)).toEqual([]);
    const c=newProject('case','hardcover');c.spec.spine=12;
    expect(validateProject(c).some(i=>i.field==='hinge')).toBe(true);
  });
  it('validates ISBN checksum and project file versions',()=>{
    expect(isValidIsbn13('٩٧٨-٠٣٠٦٤٠٦١٥٧')).toBe(true);
    expect(isValidIsbn13('9780306406158')).toBe(false);
    expect(isValidIsbn13('9770306406157')).toBe(false);
    expect(isbn13Bits('9780306406157')).toHaveLength(95);
    const reference=bwipjs.toSVG({bcid:'ean13',text:'9780306406157',includetext:false});
    const decoded=Array(95).fill('0');
    for(const path of reference.matchAll(/<path stroke="#000000" stroke-width="(\d+)" d="([^"]+)"/g)){
      const width=Number(path[1]);
      for(const bar of path[2].matchAll(/M(\d+) 145L\1 0/g)){
        const start=(Number(bar[1])-width/2)/2;
        for(let i=start;i<start+width/2;i++) decoded[i]='1';
      }
    }
    expect(decoded.join('')).toBe(isbn13Bits('9780306406157'));
    const p=valid();
    expect(parseProjectFile({format:'tajleed-project',version:1,project:p})).toEqual(p);
    expect(()=>parseProjectFile({format:'tajleed-project',version:2,project:p})).toThrow();
    expect(()=>parseProjectFile({format:'tajleed-project',version:1,project:{...p,spec:{...p.spec,width:'bad'}}})).toThrow();
  });
});
describe('document export',()=>{
  it('writes matching physical SVG/PDF sizes, outlines and explicit guide options',async()=>{
    const p=valid();
    p.barcode={enabled:true,isbn:'9780306406157',x:12,y:12,width:38,height:24};
    const svg=await exportSvg(p,fontBytes);
    expect(svg).toContain('width="314mm" height="216mm"');
    expect(svg).toContain('id="barcode"');
    expect(svg).toContain('id="annotations"><path');
    expect(svg).toContain('id="guides"');
    const pdf=await PDFDocument.load(await exportPdf(p,fontBytes));
    const page=pdf.getPages()[0];
    expect(ptToMm(page.getWidth())).toBeCloseTo(314,6);
    expect(ptToMm(page.getHeight())).toBeCloseTo(216,6);
    expect(ptToMm(page.getTrimBox().width)).toBeCloseTo(308,6);
    p.exportOptions={guides:false,measurements:false,marks:false};
    const bare=await exportSvg(p,fontBytes);
    expect(bare).not.toContain('id="guides"');
    expect(bare).not.toContain('id="annotations"');
    expect(bare).not.toContain('id="printer-marks"');
    p.exportOptions.marks=true;
    expect(await exportSvg(p,fontBytes)).toContain('id="printer-marks"');
  });
});

import { Buffer } from 'buffer';
import type { Font, PathCommand } from 'fontkit';
import type { Label } from './render';
import { ar } from '../i18n/messages';

let fontPromise: Promise<Font> | undefined;
export async function loadOutlineFont(bytes?: Uint8Array): Promise<Font> {
  if (bytes) {
    const fontkit = await import('fontkit');
    return fontkit.create(Buffer.from(bytes)) as Font;
  }
  fontPromise ??= (async()=>{
    const response = await fetch('/fonts/thmanyahsans-Regular.otf');
    if (!response.ok) throw new Error(ar.fontLoadError);
    const fontkit = await import('fontkit');
    return fontkit.create(Buffer.from(await response.arrayBuffer())) as Font;
  })();
  return fontPromise;
}
function pdfPath(commands: PathCommand[]): string {
  return commands.map(({command,args})=>{
    const a=args.map((value,index)=>index%2 ? -value : value);
    if (command==='moveTo') return 'M'+a.join(' ');
    if (command==='lineTo') return 'L'+a.join(' ');
    if (command==='quadraticCurveTo') return 'Q'+a.join(' ');
    if (command==='bezierCurveTo') return 'C'+a.join(' ');
    return 'Z';
  }).join('');
}
export function outlineLabel(font: Font, label: Label): { svg: string; glyphs: Array<{path:string;pdfPath:string;x:number;y:number;scale:number}> } {
  const run = font.layout(label.text, undefined, undefined, label.direction==='rtl'?'ar':'en', label.direction);
  const scale = label.size / font.unitsPerEm;
  let cursor = label.align === 'center' ? label.x - run.advanceWidth*scale/2 : label.x;
  const glyphs: Array<{path:string;pdfPath:string;x:number;y:number;scale:number}> = [];
  for (let i=0;i<run.glyphs.length;i++) {
    const p=run.positions[i];
    const path=run.glyphs[i].path;
    glyphs.push({path:path.toSVG(),pdfPath:pdfPath(path.commands),x:cursor+p.xOffset*scale,y:label.y-p.yOffset*scale,scale});
    cursor += p.xAdvance*scale;
  }
  const svg = glyphs.map(g=>`<path d="${g.path}" transform="translate(${g.x} ${g.y}) scale(${g.scale} ${-g.scale})" fill="#573E41"/>`).join('');
  return {svg,glyphs};
}

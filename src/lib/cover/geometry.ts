import type { CoverGeometry, CoverProject, Panel, Rect, Segment } from './types';

const inset = (r: Rect, m: CoverProject['spec']['margins']): Rect => ({ x: r.x+m.left, y: r.y+m.top, width: r.width-m.left-m.right, height: r.height-m.top-m.bottom });
export function effectiveSpine(project: CoverProject): number {
  const s = project.spec;
  return s.type === 'paperback' && s.spineMode === 'estimate' ? s.pages / 2 * s.sheetThickness + s.adjustment : s.spine;
}
export function calculateGeometry(project: CoverProject): CoverGeometry {
  const s = project.spec;
  const spine = effectiveSpine(project);
  const isCase = s.type === 'hardcover';
  const edge = s.bleed + (isCase ? s.turnIn : 0);
  const extra = isCase ? 2 * s.hinge : s.frontFlap + s.backFlap;
  const width = 2 * s.width + spine + extra + 2 * edge;
  const bleedHeight = s.height + 2 * edge;
  const height = bleedHeight + project.slug.height;
  const bleedBounds: Rect = {x:0,y:0,width,height:bleedHeight};
  const slug = project.slug.height > 0 ? {x:0,y:bleedHeight,width,height:project.slug.height} : undefined;
  const cut: Rect = { x: s.bleed, y: s.bleed, width: width-2*s.bleed, height: bleedHeight-2*s.bleed };
  const panelY = edge;
  const panels: Panel[] = [];
  const lines: Segment[] = [];
  const order: Array<{ key: Panel['key']; width: number }> = s.type === 'hardcover'
    ? project.opening === 'arabic'
      ? [{key:'front',width:s.width},{key:'frontHinge',width:s.hinge},{key:'spine',width:spine},{key:'backHinge',width:s.hinge},{key:'back',width:s.width}]
      : [{key:'back',width:s.width},{key:'backHinge',width:s.hinge},{key:'spine',width:spine},{key:'frontHinge',width:s.hinge},{key:'front',width:s.width}]
    : project.opening === 'arabic'
      ? [{key:'frontFlap',width:s.frontFlap},{key:'front',width:s.width},{key:'spine',width:spine},{key:'back',width:s.width},{key:'backFlap',width:s.backFlap}]
      : [{key:'backFlap',width:s.backFlap},{key:'back',width:s.width},{key:'spine',width:spine},{key:'front',width:s.width},{key:'frontFlap',width:s.frontFlap}];
  let x = edge;
  for (const item of order) {
    if (item.width <= 0) continue;
    const rect: Rect = {x, y: panelY, width:item.width, height:s.height};
    const safe = item.key === 'front' || item.key === 'back' ? inset(rect,s.margins) : undefined;
    panels.push({key:item.key,rect,safe});
    if (x > edge) lines.push({x1:x,y1:panelY,x2:x,y2:panelY+s.height,kind:item.key.includes('Hinge') ? 'board' : 'fold'});
    x += item.width;
  }
  const right = edge + order.reduce((sum,item)=>sum+item.width,0);
  lines.push({x1:edge,y1:panelY,x2:right,y2:panelY,kind:'trim'});
  lines.push({x1:edge,y1:panelY+s.height,x2:right,y2:panelY+s.height,kind:'trim'});
  lines.push({x1:edge,y1:panelY,x2:edge,y2:panelY+s.height,kind:'trim'});
  lines.push({x1:right,y1:panelY,x2:right,y2:panelY+s.height,kind:'trim'});
  if (isCase) {
    for (const y of [s.bleed,s.bleed+s.turnIn+s.height]) lines.push({x1:s.bleed,y1:y,x2:width-s.bleed,y2:y,kind:'fold'});
    for (const xx of [s.bleed,width-s.bleed]) lines.push({x1:xx,y1:s.bleed,x2:xx,y2:bleedHeight-s.bleed,kind:'fold'});
  }
  const back = panels.find((p)=>p.key==='back');
  const barcode = project.barcode.enabled && back ? {
    x: back.rect.x + project.barcode.x,
    y: back.rect.y + back.rect.height - project.barcode.y - project.barcode.height,
    width: project.barcode.width,
    height: project.barcode.height
  } : undefined;
  return {width,height,cut,bleedBounds,slug,bleed:s.bleed,panels,lines,barcode};
}

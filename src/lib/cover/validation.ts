import { calculateGeometry, effectiveSpine } from './geometry';
import { isValidIsbn13 } from './isbn';
import type { CoverProject, ValidationIssue } from './types';
import { ar } from '../i18n/messages';

export function validateProject(project: CoverProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (field: string, code: string, message: string) => issues.push({field,code,message});
  const s = project.spec;
  for (const field of ['width','height','bleed','safe'] as const) {
    const value = s[field];
    if (!Number.isFinite(value) || value <= 0) add(field,'positive',ar.fieldPositive);
  }
  if (s.width <= 2*s.safe || s.height <= 2*s.safe) add('safe','overlap',ar.safeOverlap);
  const spine = effectiveSpine(project);
  if (s.type === 'paperback' && s.spineMode === 'estimate') {
    if (!Number.isInteger(s.pages) || s.pages < 2 || s.pages % 2 !== 0) add('pages','pages',ar.pagesError);
    if (!Number.isFinite(s.sheetThickness) || s.sheetThickness <= 0) add('sheetThickness','thickness',ar.thicknessError);
    if (!Number.isFinite(s.adjustment)) add('adjustment','number',ar.fieldNumber);
  }
  if (!Number.isFinite(spine) || spine <= 0) add('spine','spine',ar.spineError);
  if (s.type === 'hardcover') {
    if (!Number.isFinite(s.hinge) || s.hinge <= 0) add('hinge','positive',ar.hingeError);
    if (!Number.isFinite(s.turnIn) || s.turnIn <= 0) add('turnIn','positive',ar.turnInError);
  } else {
    for (const field of ['frontFlap','backFlap'] as const) {
      if (!Number.isFinite(s[field]) || s[field] < 0) add(field,'nonnegative',ar.fieldNonnegative);
    }
    if (s.type === 'jacket' && (s.frontFlap <= 0 || s.backFlap <= 0)) add('frontFlap','jacketFlaps',ar.jacketFlapsError);
  }
  if (project.barcode.enabled) {
    const b = project.barcode;
    if (!isValidIsbn13(b.isbn)) add('isbn','isbn',ar.isbnError);
    if ([b.x,b.y,b.width,b.height].some((v)=>!Number.isFinite(v))) add('barcode','number',ar.fieldNumber);
    if (b.width < 25 || b.height < 18) add('barcode','size',ar.barcodeSizeError);
    if (!issues.some((i)=>['width','height','bleed','safe','spine'].includes(i.field))) {
      const geometry = calculateGeometry(project);
      const back = geometry.panels.find((p)=>p.key==='back');
      const area = back?.safe;
      const box = geometry.barcode;
      // Reserve a quiet zone of 3 mm on each horizontal side and 1 mm vertically.
      if (area && box && (box.x < area.x+3 || box.x+box.width > area.x+area.width-3 || box.y < area.y+1 || box.y+box.height > area.y+area.height-1)) {
        add('barcode','placement',ar.barcodePlacementError);
      }
    }
  }
  return issues;
}

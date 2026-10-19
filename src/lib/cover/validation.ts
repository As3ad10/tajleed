import { calculateGeometry, effectiveSpine } from './geometry';
import { isValidIsbn13 } from './isbn';
import type { CoverProject, ValidationIssue } from './types';
import { messages, type Language } from '../i18n/messages';

export function validateProject(project: CoverProject, language: Language = 'ar'): ValidationIssue[] {
  const t=messages[language];
  const issues: ValidationIssue[] = [];
  const add = (field: string, code: string, message: string) => issues.push({field,code,message});
  const s = project.spec;
  for (const field of ['width','height','bleed'] as const) {
    const value = s[field];
    if (!Number.isFinite(value) || value <= 0) add(field,'positive',t.fieldPositive);
  }
  for (const side of ['top','right','bottom','left'] as const) {
    if (!Number.isFinite(s.margins[side]) || s.margins[side]<0) add(`margins.${side}`,'nonnegative',t.fieldNonnegative);
  }
  if (s.width <= s.margins.left+s.margins.right || s.height <= s.margins.top+s.margins.bottom) add('margins','overlap',t.safeOverlap);
  if (!Number.isFinite(project.slug.height) || project.slug.height<0) add('slug.height','nonnegative',t.fieldNonnegative);
  else if (project.slug.height>0 && project.slug.height<8) add('slug.height','legibility',t.slugHeightError);
  const spine = effectiveSpine(project);
  if (s.type === 'paperback' && s.spineMode === 'estimate') {
    if (!Number.isInteger(s.pages) || s.pages < 2 || s.pages % 2 !== 0) add('pages','pages',t.pagesError);
    if (!Number.isFinite(s.sheetThickness) || s.sheetThickness <= 0) add('sheetThickness','thickness',t.thicknessError);
    if (!Number.isFinite(s.adjustment)) add('adjustment','number',t.fieldNumber);
  }
  if (!Number.isFinite(spine) || spine <= 0) add('spine','spine',t.spineError);
  if (s.type === 'hardcover') {
    if (!Number.isFinite(s.hinge) || s.hinge <= 0) add('hinge','positive',t.hingeError);
    if (!Number.isFinite(s.turnIn) || s.turnIn <= 0) add('turnIn','positive',t.turnInError);
  } else {
    for (const field of ['frontFlap','backFlap'] as const) {
      if (!Number.isFinite(s[field]) || s[field] < 0) add(field,'nonnegative',t.fieldNonnegative);
    }
    if (s.type === 'jacket' && (s.frontFlap <= 0 || s.backFlap <= 0)) add('frontFlap','jacketFlaps',t.jacketFlapsError);
  }
  if (project.barcode.enabled) {
    const b = project.barcode;
    if (!isValidIsbn13(b.isbn)) add('isbn','isbn',t.isbnError);
    if ([b.x,b.y,b.width,b.height].some((v)=>!Number.isFinite(v))) add('barcode','number',t.fieldNumber);
    if (b.width < 25 || b.height < 18) add('barcode','size',t.barcodeSizeError);
    if (!issues.some((i)=>['width','height','bleed','margins','spine'].includes(i.field) || i.field.startsWith('margins.'))) {
      const geometry = calculateGeometry(project);
      const back = geometry.panels.find((p)=>p.key==='back');
      const area = back?.safe;
      const box = geometry.barcode;
      // Reserve a quiet zone of 3 mm on each horizontal side and 1 mm vertically.
      if (area && box && (box.x < area.x+3 || box.x+box.width > area.x+area.width-3 || box.y < area.y+1 || box.y+box.height > area.y+area.height-1)) {
        add('barcode','placement',t.barcodePlacementError);
      }
    }
  }
  return issues;
}

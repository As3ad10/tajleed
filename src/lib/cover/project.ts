import type { Construction, CoverProject, CoverSpec } from './types';
import { ar } from '../i18n/messages';

export function defaultSpec(type: Construction): CoverSpec {
  const base = { width: 148, height: 210, spine: 0, bleed: 3, margins: {top:5,right:5,bottom:5,left:5} };
  if (type === 'hardcover') return { ...base, type, hinge: 0, turnIn: 0 };
  if (type === 'jacket') return { ...base, type, frontFlap: 0, backFlap: 0 };
  return { ...base, type, frontFlap: 0, backFlap: 0, spineMode: 'manual', pages: 0, sheetThickness: 0, adjustment: 0 };
}
export function newProject(name: string = ar.projectFallback, type: Construction = 'paperback'): CoverProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2, id: crypto.randomUUID(), name, createdAt: now, updatedAt: now,
    opening: 'arabic', spec: defaultSpec(type),
    slug: {height:0,text:''},
    barcode: { enabled: false, isbn: '', x: 12, y: 12, width: 38, height: 24 },
    exportOptions: { guides: true, measurements: true, marks: false }
  };
}
export function duplicateProject(project: CoverProject, suffix: string = ar.copySuffix): CoverProject {
  const now = new Date().toISOString();
  // A Svelte state proxy cannot be passed to structuredClone; project data is JSON serializable.
  return { ...(JSON.parse(JSON.stringify(project)) as CoverProject), id: crypto.randomUUID(), name: `${project.name} — ${suffix}`, createdAt: now, updatedAt: now };
}

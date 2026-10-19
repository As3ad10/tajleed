import { openDB, type DBSchema } from 'idb';
import { projectSchema } from './schema';
import type { CoverProject } from './types';

interface TajleedDB extends DBSchema {
  projects: { key: string; value: CoverProject; indexes: { 'by-updated': string } };
  meta: { key: string; value: string };
}
const database = () => openDB<TajleedDB>('tajleed', 1, {
  upgrade(db) {
    const projects = db.createObjectStore('projects', {keyPath:'id'});
    projects.createIndex('by-updated','updatedAt');
    db.createObjectStore('meta');
  }
});
export async function listProjects(): Promise<CoverProject[]> {
  const db = await database();
  const values = await db.getAll('projects');
  return values.flatMap((value)=> {const result=projectSchema.safeParse(value); return result.success ? [result.data as CoverProject] : [];}).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
export async function saveProject(project: CoverProject): Promise<void> {
  const db = await database();
  await db.put('projects', projectSchema.parse(project) as CoverProject);
  await db.put('meta',project.id,'lastProject');
}
export async function deleteProject(id: string): Promise<void> {
  const db=await database();
  await db.delete('projects',id);
}
export async function lastProjectId(): Promise<string | undefined> {
  const db=await database();
  return db.get('meta','lastProject');
}

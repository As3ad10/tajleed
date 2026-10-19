import { z } from 'zod';

const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const margins = z.object({top:nonnegative,right:nonnegative,bottom:nonnegative,left:nonnegative});
const base = { width: positive, height: positive, spine: nonnegative, bleed: positive, margins };
const spec = z.discriminatedUnion('type', [
  z.object({type:z.literal('paperback'), ...base, frontFlap:nonnegative, backFlap:nonnegative, spineMode:z.enum(['manual','estimate']), pages:nonnegative, sheetThickness:nonnegative, adjustment:z.number().finite()}),
  z.object({type:z.literal('hardcover'), ...base, hinge:nonnegative, turnIn:nonnegative}),
  z.object({type:z.literal('jacket'), ...base, frontFlap:nonnegative, backFlap:nonnegative})
]);
export const projectSchema = z.object({
  schemaVersion: z.literal(2), id:z.string().uuid(), name:z.string().trim().min(1).max(120),
  createdAt:z.iso.datetime(), updatedAt:z.iso.datetime(), opening:z.enum(['arabic','english']), spec,
  slug:z.object({height:nonnegative,text:z.string().max(120)}),
  barcode:z.object({enabled:z.boolean(),isbn:z.string().max(40),x:z.number().finite(),y:z.number().finite(),width:z.number().finite(),height:z.number().finite()}),
  exportOptions:z.object({guides:z.boolean(),measurements:z.boolean(),marks:z.boolean()})
});
const oldBase = { width: positive, height: positive, spine: nonnegative, bleed: positive, safe: positive };
const oldSpec = z.discriminatedUnion('type', [
  z.object({type:z.literal('paperback'),...oldBase,frontFlap:nonnegative,backFlap:nonnegative,spineMode:z.enum(['manual','estimate']),pages:nonnegative,sheetThickness:nonnegative,adjustment:z.number().finite()}),
  z.object({type:z.literal('hardcover'),...oldBase,hinge:nonnegative,turnIn:nonnegative}),
  z.object({type:z.literal('jacket'),...oldBase,frontFlap:nonnegative,backFlap:nonnegative})
]);
const oldProjectSchema = projectSchema.omit({schemaVersion:true,spec:true,slug:true}).extend({schemaVersion:z.literal(1),spec:oldSpec});
export function migrateProject(value: unknown) {
  const current=projectSchema.safeParse(value);
  if (current.success) return current.data;
  const old=oldProjectSchema.parse(value);
  const {safe,...rest}=old.spec;
  return projectSchema.parse({...old,schemaVersion:2,spec:{...rest,margins:{top:safe,right:safe,bottom:safe,left:safe}},slug:{height:0,text:''}});
}
export function parseProjectFile(value: unknown) {
  const envelope = z.object({format:z.literal('tajleed-project'),version:z.union([z.literal(1),z.literal(2)]),project:z.unknown()}).parse(value);
  if (envelope.version===2) return projectSchema.parse(envelope.project);
  return migrateProject(oldProjectSchema.parse(envelope.project));
}

import { z } from 'zod';

const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const base = { width: positive, height: positive, spine: nonnegative, bleed: positive, safe: positive };
const spec = z.discriminatedUnion('type', [
  z.object({type:z.literal('paperback'), ...base, frontFlap:nonnegative, backFlap:nonnegative, spineMode:z.enum(['manual','estimate']), pages:nonnegative, sheetThickness:nonnegative, adjustment:z.number().finite()}),
  z.object({type:z.literal('hardcover'), ...base, hinge:nonnegative, turnIn:nonnegative}),
  z.object({type:z.literal('jacket'), ...base, frontFlap:nonnegative, backFlap:nonnegative})
]);
export const projectSchema = z.object({
  schemaVersion: z.literal(1), id:z.string().uuid(), name:z.string().trim().min(1).max(120),
  createdAt:z.iso.datetime(), updatedAt:z.iso.datetime(), opening:z.enum(['arabic','english']), spec,
  barcode:z.object({enabled:z.boolean(),isbn:z.string().max(40),x:z.number().finite(),y:z.number().finite(),width:z.number().finite(),height:z.number().finite()}),
  exportOptions:z.object({guides:z.boolean(),measurements:z.boolean(),marks:z.boolean()})
});
export function parseProjectFile(value: unknown) {
  const envelope = z.object({format:z.literal('tajleed-project'),version:z.literal(1),project:projectSchema}).parse(value);
  return envelope.project;
}

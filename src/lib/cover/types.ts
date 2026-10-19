export type Construction = 'paperback' | 'hardcover' | 'jacket';
export type Opening = 'arabic' | 'english';
export type SpineMode = 'manual' | 'estimate';

export interface BaseSpec {
  type: Construction;
  width: number;
  height: number;
  spine: number;
  bleed: number;
  safe: number;
}
export interface PaperbackSpec extends BaseSpec {
  type: 'paperback';
  frontFlap: number;
  backFlap: number;
  spineMode: SpineMode;
  pages: number;
  sheetThickness: number;
  adjustment: number;
}
export interface HardcoverSpec extends BaseSpec {
  type: 'hardcover';
  hinge: number;
  turnIn: number;
}
export interface JacketSpec extends BaseSpec {
  type: 'jacket';
  frontFlap: number;
  backFlap: number;
}
export type CoverSpec = PaperbackSpec | HardcoverSpec | JacketSpec;

export interface BarcodeOptions {
  enabled: boolean;
  isbn: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ExportOptions {
  guides: boolean;
  measurements: boolean;
  marks: boolean;
}
export interface CoverProject {
  schemaVersion: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  opening: Opening;
  spec: CoverSpec;
  barcode: BarcodeOptions;
  exportOptions: ExportOptions;
}

export interface Rect { x: number; y: number; width: number; height: number }
export interface Segment { x1: number; y1: number; x2: number; y2: number; kind: 'fold' | 'trim' | 'safe' | 'board' }
export interface Panel { key: 'front' | 'back' | 'spine' | 'frontFlap' | 'backFlap' | 'frontHinge' | 'backHinge'; rect: Rect; safe?: Rect }
export interface CoverGeometry {
  width: number;
  height: number;
  cut: Rect;
  bleed: number;
  panels: Panel[];
  lines: Segment[];
  barcode?: Rect;
}
export interface ValidationIssue { field: string; code: string; message: string }

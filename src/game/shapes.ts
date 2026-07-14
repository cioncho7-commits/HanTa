import type { Point, ShapeDef, ShapeName } from './types';

// Cell offsets are listed in the order that word syllables are assigned to them.
// Rotation preserves array order, so a letter always stays glued to its cell.
const SHAPES: ShapeDef[] = [
  { name: 'I1', size: 1, cells: [{ x: 0, y: 0 }] },
  { name: 'I2', size: 2, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  { name: 'I3', size: 3, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { name: 'L3', size: 3, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: 'I4', size: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  { name: 'L4', size: 4, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { name: 'T4', size: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
  { name: 'I5', size: 5, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }] },
  { name: 'L5', size: 5, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 3 }] },
];

export const SHAPES_BY_SIZE: Record<number, ShapeDef[]> = {
  1: SHAPES.filter((s) => s.size === 1),
  2: SHAPES.filter((s) => s.size === 2),
  3: SHAPES.filter((s) => s.size === 3),
  4: SHAPES.filter((s) => s.size === 4),
  5: SHAPES.filter((s) => s.size === 5),
};

export function getShape(name: ShapeName): ShapeDef {
  const shape = SHAPES.find((s) => s.name === name);
  if (!shape) throw new Error(`Unknown shape ${name}`);
  return shape;
}

// Rotate 90 degrees clockwise around the shape's bounding box, then
// re-normalize so the minimum x/y is 0. Cell array order is preserved so
// each syllable stays attached to the same physical cell after rotating.
export function rotateCells(cells: Point[]): Point[] {
  const maxY = Math.max(...cells.map((c) => c.y));
  const rotated = cells.map((c) => ({ x: maxY - c.y, y: c.x }));
  const minX = Math.min(...rotated.map((c) => c.x));
  const minY = Math.min(...rotated.map((c) => c.y));
  return rotated.map((c) => ({ x: c.x - minX, y: c.y - minY }));
}

export const BLOCK_COLORS = [
  '#ff7676', '#ffb648', '#ffe066', '#8ce99a', '#66d9e8',
  '#74c0fc', '#b197fc', '#f783ac', '#63e6be', '#ffa8a8',
];

export function colorForSize(size: number): string {
  return BLOCK_COLORS[(size - 1) % BLOCK_COLORS.length];
}

export function pieceWidth(cells: Point[]): number {
  return Math.max(...cells.map((c) => c.x)) + 1;
}

export function pieceHeight(cells: Point[]): number {
  return Math.max(...cells.map((c) => c.y)) + 1;
}

export type { ShapeName };

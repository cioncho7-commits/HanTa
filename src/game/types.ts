export interface Point {
  x: number;
  y: number;
}

export type ShapeName = 'I1' | 'I2' | 'I3' | 'L3' | 'I4' | 'L4' | 'T4' | 'I5' | 'L5';

export interface ShapeDef {
  name: ShapeName;
  size: number;
  cells: Point[];
}

export interface ActivePiece {
  shapeName: ShapeName;
  cells: Point[];
  letters: string[];
  word: string;
  originCol: number;
  originRow: number;
  matched: boolean;
  color: string;
}

export interface LockedCell {
  letter: string;
  color: string;
  blank: boolean;
}

export type Board = (LockedCell | null)[][];

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface DifficultyRange {
  min: number;
  max: number;
}

export const DIFFICULTY_RANGES: Record<Difficulty, DifficultyRange> = {
  beginner: { min: 1, max: 2 },
  intermediate: { min: 1, max: 4 },
  advanced: { min: 1, max: 5 },
};

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivePiece, Board, Difficulty, LockedCell } from './types';
import { DIFFICULTY_RANGES } from './types';
import { SHAPES_BY_SIZE, colorForSize, rotateCells, pieceWidth } from './shapes';
import { WORDS_BY_LENGTH } from './words';

export const COLS = 16;
export const ROWS = 28;
export const CELL_PX = 14;
export const GRAVITY_MS = 3000;
export const FLOOR_RISE_MS = 20000;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildWordBag(difficulty: Difficulty): { size: number; word: string }[] {
  const { min, max } = DIFFICULTY_RANGES[difficulty];
  const bag: { size: number; word: string }[] = [];
  for (let n = min; n <= max; n++) {
    for (const word of WORDS_BY_LENGTH[n]) bag.push({ size: n, word });
  }
  return shuffle(bag);
}

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<LockedCell | null>(COLS).fill(null));
}

function collides(board: Board, cells: { x: number; y: number }[], col: number, row: number): boolean {
  for (const c of cells) {
    const bx = col + c.x;
    const by = row + c.y;
    if (bx < 0 || bx >= COLS || by >= ROWS) return true;
    if (by < 0) continue;
    if (board[by][bx]) return true;
  }
  return false;
}

export interface HighScoreEntry {
  score: number;
  nickname: string;
  keyboardName: string;
}

interface EngineOptions {
  difficulty: Difficulty;
  nickname: string;
  keyboardName: string;
}

export function useGameEngine({ difficulty, nickname, keyboardName }: EngineOptions) {
  const boardRef = useRef<Board>(emptyBoard());
  const pieceRef = useRef<ActivePiece | null>(null);
  const bagRef = useRef<{ size: number; word: string }[]>(buildWordBag(difficulty));
  const typedRef = useRef<string>('');
  const dragBaseXRef = useRef<number | null>(null);

  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [typed, setTyped] = useState('');
  const [highScore, setHighScore] = useState<HighScoreEntry>(() => {
    const raw = localStorage.getItem('hanta_high_score');
    return raw ? (JSON.parse(raw) as HighScoreEntry) : { score: 0, nickname: '', keyboardName: '' };
  });

  const nextWordFor = useCallback((): { size: number; word: string } => {
    if (bagRef.current.length === 0) bagRef.current = buildWordBag(difficulty);
    return bagRef.current.pop()!;
  }, [difficulty]);

  const spawnPiece = useCallback(() => {
    const { size, word } = nextWordFor();
    const variants = SHAPES_BY_SIZE[size];
    const shape = variants[Math.floor(Math.random() * variants.length)];
    const w = pieceWidth(shape.cells);
    const originCol = Math.floor(Math.random() * Math.max(1, COLS - w + 1));
    const piece: ActivePiece = {
      shapeName: shape.name,
      cells: shape.cells,
      letters: word.split(''),
      word,
      originCol,
      originRow: 0,
      matched: false,
      color: colorForSize(size),
    };
    if (collides(boardRef.current, piece.cells, piece.originCol, piece.originRow)) {
      setGameOver(true);
      setRunning(false);
      pieceRef.current = null;
      rerender();
      return;
    }
    pieceRef.current = piece;
    typedRef.current = '';
    setTyped('');
    rerender();
  }, [nextWordFor, rerender]);

  const clearFullRows = useCallback(() => {
    const board = boardRef.current;
    const keep = board.filter((row) => row.some((cell) => cell === null));
    const clearedCount = ROWS - keep.length;
    if (clearedCount > 0) {
      const fresh: Board = Array.from({ length: clearedCount }, () => Array<LockedCell | null>(COLS).fill(null));
      boardRef.current = [...fresh, ...keep];
      setScore((s) => {
        const next = s + clearedCount * COLS;
        setHighScore((prevHigh) => {
          if (next > prevHigh.score) {
            const entry = { score: next, nickname, keyboardName };
            localStorage.setItem('hanta_high_score', JSON.stringify(entry));
            return entry;
          }
          return prevHigh;
        });
        return next;
      });
    }
  }, [nickname, keyboardName]);

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    const board = boardRef.current;
    piece.cells.forEach((c, i) => {
      const bx = piece.originCol + c.x;
      const by = piece.originRow + c.y;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        board[by][bx] = {
          letter: piece.matched ? '' : piece.letters[i],
          color: piece.color,
          blank: piece.matched,
        };
      }
    });
    pieceRef.current = null;
    clearFullRows();
    spawnPiece();
  }, [clearFullRows, spawnPiece]);

  const moveDown = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || !running) return;
    if (!collides(boardRef.current, piece.cells, piece.originCol, piece.originRow + 1)) {
      piece.originRow += 1;
      rerender();
    } else {
      lockPiece();
    }
  }, [gameOver, running, lockPiece, rerender]);

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || !piece.matched || gameOver || !running) return;
    while (!collides(boardRef.current, piece.cells, piece.originCol, piece.originRow + 1)) {
      piece.originRow += 1;
    }
    lockPiece();
  }, [gameOver, running, lockPiece]);

  const rotate = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || !piece.matched || gameOver || !running) return;
    const rotated = rotateCells(piece.cells);
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collides(boardRef.current, rotated, piece.originCol + k, piece.originRow)) {
        piece.cells = rotated;
        piece.originCol += k;
        rerender();
        return;
      }
    }
  }, [gameOver, running, rerender]);

  const moveHorizontal = useCallback(
    (dir: number) => {
      const piece = pieceRef.current;
      if (!piece || !piece.matched || gameOver || !running) return;
      if (!collides(boardRef.current, piece.cells, piece.originCol + dir, piece.originRow)) {
        piece.originCol += dir;
        rerender();
      }
    },
    [gameOver, running, rerender],
  );

  const floorRise = useCallback(() => {
    if (gameOver || !running) return;
    const board = boardRef.current;
    if (board[0].some((cell) => cell !== null)) {
      setGameOver(true);
      setRunning(false);
      rerender();
      return;
    }
    const garbageRow: (LockedCell | null)[] = Array.from({ length: COLS }, () => ({
      letter: '',
      color: '#5c5f66',
      blank: true,
    }));
    boardRef.current = [...board.slice(1), garbageRow];
    const piece = pieceRef.current;
    if (piece) {
      piece.originRow -= 1;
      if (collides(boardRef.current, piece.cells, piece.originCol, piece.originRow)) {
        setGameOver(true);
        setRunning(false);
      }
    }
    rerender();
  }, [gameOver, running, rerender]);

  const handleTypeChar = useCallback(
    (raw: string) => {
      typedRef.current = raw;
      setTyped(raw);
      const piece = pieceRef.current;
      if (piece && !piece.matched && raw === piece.word) {
        piece.matched = true;
        typedRef.current = '';
        setTyped('');
        rerender();
      }
    },
    [rerender],
  );

  const startDrag = useCallback((clientX: number) => {
    dragBaseXRef.current = clientX;
  }, []);

  const dragMove = useCallback(
    (clientX: number) => {
      if (dragBaseXRef.current === null) return;
      const delta = clientX - dragBaseXRef.current;
      if (Math.abs(delta) >= CELL_PX) {
        const steps = Math.trunc(delta / CELL_PX);
        for (let i = 0; i < Math.abs(steps); i++) moveHorizontal(Math.sign(steps));
        dragBaseXRef.current += steps * CELL_PX;
      }
    },
    [moveHorizontal],
  );

  const endDrag = useCallback(() => {
    dragBaseXRef.current = null;
  }, []);

  const start = useCallback(() => {
    boardRef.current = emptyBoard();
    bagRef.current = buildWordBag(difficulty);
    pieceRef.current = null;
    setScore(0);
    setGameOver(false);
    setRunning(true);
    spawnPiece();
  }, [difficulty, spawnPiece]);

  useEffect(() => {
    if (!running || gameOver) return;
    const gravityId = setInterval(moveDown, GRAVITY_MS);
    const riseId = setInterval(floorRise, FLOOR_RISE_MS);
    return () => {
      clearInterval(gravityId);
      clearInterval(riseId);
    };
  }, [running, gameOver, moveDown, floorRise]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!running || gameOver) return;
      if (e.code === 'Space') {
        e.preventDefault();
        rotate();
      } else if (e.key === 'Backspace') {
        const active = document.activeElement;
        const inInput = active && (active as HTMLElement).tagName === 'INPUT';
        const piece = pieceRef.current;
        if (piece?.matched) {
          e.preventDefault();
          hardDrop();
        } else if (inInput && typedRef.current.length > 0) {
          // let default backspace edit the typing buffer before match
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, gameOver, rotate, hardDrop]);

  return {
    board: boardRef.current,
    piece: pieceRef.current,
    score,
    highScore,
    gameOver,
    running,
    typed,
    start,
    handleTypeChar,
    rotate,
    hardDrop,
    startDrag,
    dragMove,
    endDrag,
  };
}

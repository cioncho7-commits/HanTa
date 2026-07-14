import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ActivePiece, Board as BoardType, LockedCell } from './types';
import { CELL_PX, COLS, ROWS } from './engine';
import './Board.css';

interface BoardProps {
  board: BoardType;
  piece: ActivePiece | null;
  onDragStart: (clientX: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
}

export default function Board({ board, piece, onDragStart, onDragMove, onDragEnd }: BoardProps) {
  const draggingRef = useRef(false);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!piece?.matched) return;
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onDragStart(e.clientX);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    onDragMove(e.clientX);
  }

  function handlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onDragEnd();
  }

  const display: (LockedCell | null)[][] = board.map((row) => row.slice());
  if (piece) {
    piece.cells.forEach((c, i) => {
      const bx = piece.originCol + c.x;
      const by = piece.originRow + c.y;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        display[by][bx] = {
          letter: piece.matched ? '' : piece.letters[i],
          color: piece.color,
          blank: piece.matched,
        };
      }
    });
  }

  return (
    <div
      className="board"
      style={{ width: COLS * CELL_PX, height: ROWS * CELL_PX }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {display.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="board-cell"
            style={{
              left: x * CELL_PX,
              top: y * CELL_PX,
              width: CELL_PX,
              height: CELL_PX,
              background: cell ? cell.color : undefined,
            }}
          >
            {cell && !cell.blank ? cell.letter : null}
          </div>
        )),
      )}
    </div>
  );
}

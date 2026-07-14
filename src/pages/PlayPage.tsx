import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameEngine } from '../game/engine';
import Board from '../game/Board';
import TopHUD from '../components/TopHUD';
import InputBar from '../components/InputBar';
import KeyboardFooter from '../components/KeyboardFooter';
import type { Difficulty } from '../game/types';
import './PlayPage.css';

interface PlayLocationState {
  nickname: string;
  keyboardName: string;
  difficulty: Difficulty;
}

export default function PlayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PlayLocationState | null;

  useEffect(() => {
    if (!state) navigate('/');
  }, [state, navigate]);

  if (!state) return null;

  return <PlayInner nickname={state.nickname} keyboardName={state.keyboardName} difficulty={state.difficulty} />;
}

interface PlayInnerProps {
  nickname: string;
  keyboardName: string;
  difficulty: Difficulty;
}

function PlayInner({ nickname, keyboardName, difficulty }: PlayInnerProps) {
  const navigate = useNavigate();
  const engine = useGameEngine({ difficulty, nickname, keyboardName });

  useEffect(() => {
    engine.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="play-page">
      <TopHUD score={engine.score} highScore={engine.highScore} nickname={nickname} keyboardName={keyboardName} />

      <div className="play-body">
        <Board
          board={engine.board}
          piece={engine.piece}
          onDragStart={engine.startDrag}
          onDragMove={engine.dragMove}
          onDragEnd={engine.endDrag}
        />

        {engine.gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-card">
              <h2>게임 오버</h2>
              <p>최종 점수: {engine.score}</p>
              <button type="button" onClick={() => engine.start()}>
                다시 시작
              </button>
              <button type="button" onClick={() => navigate('/')} className="logout-link">
                처음으로
              </button>
            </div>
          </div>
        )}
      </div>

      <InputBar value={engine.typed} onChange={engine.handleTypeChar} disabled={engine.gameOver || !engine.running} />
      <KeyboardFooter keyboardName={keyboardName} />
    </div>
  );
}

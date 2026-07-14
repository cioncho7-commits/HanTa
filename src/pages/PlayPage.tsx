import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useGameEngine } from '../game/engine';
import Board from '../game/Board';
import TopHUD from '../components/TopHUD';
import InputBar from '../components/InputBar';
import KeyboardFooter from '../components/KeyboardFooter';
import DifficultySelect from '../components/DifficultySelect';
import type { Difficulty } from '../game/types';
import './PlayPage.css';

export default function PlayPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <PlayInner
      nickname={user.nickname}
      keyboardName={user.keyboardName}
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
      onLogout={() => {
        logout();
        navigate('/');
      }}
    />
  );
}

interface PlayInnerProps {
  nickname: string;
  keyboardName: string;
  difficulty: Difficulty | null;
  onSelectDifficulty: (d: Difficulty) => void;
  onLogout: () => void;
}

function PlayInner({ nickname, keyboardName, difficulty, onSelectDifficulty, onLogout }: PlayInnerProps) {
  const engine = useGameEngine({
    difficulty: difficulty ?? 'beginner',
    nickname,
    keyboardName,
  });

  function handleChooseDifficulty(d: Difficulty) {
    onSelectDifficulty(d);
  }

  function startWithDifficulty(d: Difficulty) {
    handleChooseDifficulty(d);
    setTimeout(() => engine.start(), 0);
  }

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

        {difficulty === null && <DifficultySelect onSelect={startWithDifficulty} />}

        {engine.gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-card">
              <h2>게임 오버</h2>
              <p>최종 점수: {engine.score}</p>
              <button type="button" onClick={() => engine.start()}>
                다시 시작
              </button>
              <button type="button" onClick={onLogout} className="logout-link">
                로그아웃
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

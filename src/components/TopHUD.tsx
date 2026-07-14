import type { HighScoreEntry } from '../game/engine';
import './TopHUD.css';

interface TopHUDProps {
  score: number;
  highScore: HighScoreEntry;
  nickname: string;
  keyboardName: string;
}

export default function TopHUD({ score, highScore, nickname, keyboardName }: TopHUDProps) {
  const highScoreHolder =
    highScore.nickname && highScore.keyboardName ? `(${highScore.nickname}-${highScore.keyboardName})` : '';

  return (
    <div className="top-hud">
      <div className="hud-scores">
        <span>내스코어 {score}</span>
        <span className="hud-sep">/</span>
        <span>
          최고스코어 {highScore.score} {highScoreHolder}
        </span>
      </div>
      <div className="hud-nickname">
        {nickname}({keyboardName})
      </div>
    </div>
  );
}

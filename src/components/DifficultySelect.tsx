import type { Difficulty } from '../game/types';
import './DifficultySelect.css';

const OPTIONS: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'beginner', label: '초급', desc: '1~2글자 단어' },
  { key: 'intermediate', label: '중급', desc: '1~4글자 단어' },
  { key: 'advanced', label: '고급', desc: '1~5글자 단어' },
];

interface DifficultySelectProps {
  onSelect: (d: Difficulty) => void;
}

export default function DifficultySelect({ onSelect }: DifficultySelectProps) {
  return (
    <div className="difficulty-overlay">
      <div className="difficulty-card">
        <h2>스테이지 선택</h2>
        <div className="difficulty-options">
          {OPTIONS.map((o) => (
            <button key={o.key} onClick={() => onSelect(o.key)} type="button">
              <span className="difficulty-label">{o.label}</span>
              <span className="difficulty-desc">{o.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

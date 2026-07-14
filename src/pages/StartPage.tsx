import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEYBOARD_APPS } from '../game/keyboards';
import type { Difficulty } from '../game/types';
import './StartPage.css';

const DIFFICULTY_OPTIONS: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'beginner', label: '초급', desc: '1~2글자' },
  { key: 'intermediate', label: '중급', desc: '1~4글자' },
  { key: 'advanced', label: '고급', desc: '1~5글자' },
];

export default function StartPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [keyboardName, setKeyboardName] = useState(KEYBOARD_APPS[0]);
  const [error, setError] = useState<string | null>(null);

  function handleSelectDifficulty(difficulty: Difficulty) {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    setError(null);
    navigate('/play', { state: { nickname: nickname.trim(), keyboardName, difficulty } });
  }

  return (
    <div className="start-page">
      <header className="start-header">
        <div className="hanta-logo" aria-hidden="true">
          <div className="logo-key logo-key-1">한</div>
          <div className="logo-key logo-key-2">타</div>
        </div>
        <h1 className="hanta-title">HanTa</h1>
      </header>

      <main className="start-main">
        <div className="entry-card">
          <div className="entry-row">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="게임에서 사용할 닉네임"
              autoFocus
            />
          </div>

          <div className="entry-row">
            <label htmlFor="keyboard">키보드어플이름</label>
            <select id="keyboard" value={keyboardName} onChange={(e) => setKeyboardName(e.target.value)}>
              {KEYBOARD_APPS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="entry-row">
            <span className="entry-row-title">스테이지 선택</span>
            <div className="difficulty-row">
              {DIFFICULTY_OPTIONS.map((o) => (
                <button key={o.key} type="button" className="difficulty-box" onClick={() => handleSelectDifficulty(o.key)}>
                  <span className="difficulty-box-label">{o.label}</span>
                  <span className="difficulty-box-desc">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="entry-error">{error}</p>}
        </div>
      </main>
    </div>
  );
}

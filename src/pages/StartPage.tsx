import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { KEYBOARD_APPS } from '../game/keyboards';
import './StartPage.css';

type Mode = 'login' | 'signup';
type SocialProvider = 'google' | 'kakao' | 'naver';

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: 'Google 계정으로 계속하기',
  kakao: '카카오 계정으로 계속하기',
  naver: '네이버 계정으로 계속하기',
};

export default function StartPage() {
  const navigate = useNavigate();
  const { login, signup, socialLogin } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [keyboardName, setKeyboardName] = useState(KEYBOARD_APPS[0]);
  const [error, setError] = useState<string | null>(null);

  const [socialModal, setSocialModal] = useState<SocialProvider | null>(null);
  const [socialNickname, setSocialNickname] = useState('');
  const [socialKeyboard, setSocialKeyboard] = useState(KEYBOARD_APPS[0]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result =
      mode === 'login' ? login(email, password) : signup(email, password, nickname, keyboardName);
    if (result) {
      setError(result);
      return;
    }
    navigate('/play');
  }

  function openSocial(provider: SocialProvider) {
    setSocialModal(provider);
    setSocialNickname('');
    setSocialKeyboard(KEYBOARD_APPS[0]);
  }

  function confirmSocial() {
    if (!socialModal || !socialNickname) return;
    socialLogin(socialModal, socialNickname, socialKeyboard);
    setSocialModal(null);
    navigate('/play');
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
        <div className="auth-card">
          <div className="mode-tabs">
            <button
              className={mode === 'login' ? 'tab active' : 'tab'}
              onClick={() => setMode('login')}
              type="button"
            >
              로그인
            </button>
            <button
              className={mode === 'signup' ? 'tab active' : 'tab'}
              onClick={() => setMode('signup')}
              type="button"
            >
              회원가입
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              이메일
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label>
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={4}
              />
            </label>
            {mode === 'signup' && (
              <>
                <label>
                  닉네임
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="게임에서 사용할 닉네임"
                  />
                </label>
                <label>
                  사용 중인 한글 키보드 앱
                  <select value={keyboardName} onChange={(e) => setKeyboardName(e.target.value)}>
                    {KEYBOARD_APPS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="primary-btn">
              {mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <div className="divider">
            <span>또는</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn google" onClick={() => openSocial('google')} type="button">
              {SOCIAL_LABEL.google}
            </button>
            <button className="social-btn kakao" onClick={() => openSocial('kakao')} type="button">
              {SOCIAL_LABEL.kakao}
            </button>
            <button className="social-btn naver" onClick={() => openSocial('naver')} type="button">
              {SOCIAL_LABEL.naver}
            </button>
          </div>
          <p className="social-note">
            * 데모 환경으로 실제 OAuth 연동 대신 닉네임/키보드 앱 이름을 입력해 소셜 로그인을 시뮬레이션합니다.
          </p>
        </div>
      </main>

      {socialModal && (
        <div className="modal-backdrop" onClick={() => setSocialModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{SOCIAL_LABEL[socialModal]}</h2>
            <label>
              닉네임
              <input
                type="text"
                value={socialNickname}
                onChange={(e) => setSocialNickname(e.target.value)}
                placeholder="게임에서 사용할 닉네임"
                autoFocus
              />
            </label>
            <label>
              사용 중인 한글 키보드 앱
              <select value={socialKeyboard} onChange={(e) => setSocialKeyboard(e.target.value)}>
                {KEYBOARD_APPS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setSocialModal(null)}>
                취소
              </button>
              <button type="button" className="primary-btn" onClick={confirmSocial} disabled={!socialNickname}>
                계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

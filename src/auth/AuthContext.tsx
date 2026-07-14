import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface HanTaUser {
  id: string;
  email: string;
  nickname: string;
  keyboardName: string;
  provider: 'email' | 'google' | 'kakao' | 'naver';
}

interface StoredAccount extends HanTaUser {
  password?: string;
}

interface AuthContextValue {
  user: HanTaUser | null;
  signup: (email: string, password: string, nickname: string, keyboardName: string) => string | null;
  login: (email: string, password: string) => string | null;
  socialLogin: (provider: 'google' | 'kakao' | 'naver', nickname: string, keyboardName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNTS_KEY = 'hanta_accounts';
const SESSION_KEY = 'hanta_session';

function loadAccounts(): StoredAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toPublicUser(a: StoredAccount): HanTaUser {
  const { password: _password, ...rest } = a;
  return rest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HanTaUser | null>(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as HanTaUser) : null;
  });

  const persistSession = useCallback((u: HanTaUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
    setUser(u);
  }, []);

  const signup = useCallback(
    (email: string, password: string, nickname: string, keyboardName: string): string | null => {
      if (!email || !password || !nickname || !keyboardName) return '모든 항목을 입력해주세요.';
      const accounts = loadAccounts();
      if (accounts.some((a) => a.email === email)) return '이미 가입된 이메일입니다.';
      const account: StoredAccount = {
        id: crypto.randomUUID(),
        email,
        password,
        nickname,
        keyboardName,
        provider: 'email',
      };
      accounts.push(account);
      saveAccounts(accounts);
      persistSession(toPublicUser(account));
      return null;
    },
    [persistSession],
  );

  const login = useCallback(
    (email: string, password: string): string | null => {
      const accounts = loadAccounts();
      const account = accounts.find((a) => a.email === email && a.provider === 'email');
      if (!account || account.password !== password) return '이메일 또는 비밀번호가 올바르지 않습니다.';
      persistSession(toPublicUser(account));
      return null;
    },
    [persistSession],
  );

  const socialLogin = useCallback(
    (provider: 'google' | 'kakao' | 'naver', nickname: string, keyboardName: string) => {
      const accounts = loadAccounts();
      const email = `${provider}_${nickname}@hanta.local`;
      let account = accounts.find((a) => a.email === email && a.provider === provider);
      if (!account) {
        account = { id: crypto.randomUUID(), email, nickname, keyboardName, provider };
        accounts.push(account);
        saveAccounts(accounts);
      } else {
        account.nickname = nickname;
        account.keyboardName = keyboardName;
        saveAccounts(accounts);
      }
      persistSession(toPublicUser(account));
    },
    [persistSession],
  );

  const logout = useCallback(() => persistSession(null), [persistSession]);

  const value = useMemo(
    () => ({ user, signup, login, socialLogin, logout }),
    [user, signup, login, socialLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

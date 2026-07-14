import type { ChangeEvent } from 'react';
import './InputBar.css';

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function InputBar({ value, onChange, disabled }: InputBarProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <div className="input-bar">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="떨어지는 단어를 입력하세요"
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}

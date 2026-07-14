import './KeyboardFooter.css';

interface KeyboardFooterProps {
  keyboardName: string;
}

export default function KeyboardFooter({ keyboardName }: KeyboardFooterProps) {
  return (
    <div className="keyboard-footer">
      사용 중인 키보드: <strong>{keyboardName}</strong>
    </div>
  );
}

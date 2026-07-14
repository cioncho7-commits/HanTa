import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import StartPage from './pages/StartPage';
import PlayPage from './pages/PlayPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

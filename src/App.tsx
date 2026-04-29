import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-m-black text-white">
        {/* Проста навігація для розробки (потім приховаємо) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-secret-login" element={<AdminLogin />} />
          <Route path="/admin-panel" element={<div className="p-10 text-2xl font-bold">Панель керування (в розробці)</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
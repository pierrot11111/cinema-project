import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-m-black text-white">
        {/* Навігаційна панель */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-m-dark">
          <Link to="/" className="text-xl font-bold text-m-accent tracking-tighter uppercase">
            Multiplex <span className="text-white">Clone</span>
          </Link>
          
          {/* Кнопка входу (прихована стилістично) */}
          <Link 
            to="/admin-secret-login" 
            className="text-xs text-gray-600 hover:text-m-accent transition-colors"
          >
            Адмін-панель
          </Link>
        </header>

        <Routes>
          {/* Головна сторінка для всіх користувачів */}
          <Route path="/" element={<Home />} />
          
          {/* Секретна сторінка логіну */}
          <Route path="/admin-secret-login" element={<AdminLogin />} />
          
          {/* Сторінка керування (адмінка) */}
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
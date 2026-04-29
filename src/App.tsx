import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Booking from './pages/Booking'; // Не забудь создать этот файл!

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-m-black text-white">
        {/* Шапка сайта */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-m-dark sticky top-0 z-50">
          <Link to="/" className="text-xl font-bold text-m-accent tracking-tighter uppercase">
            Multiplex <span className="text-white">Clone</span>
          </Link>
          
          <Link 
            to="/admin-secret-login" 
            className="text-xs text-gray-600 hover:text-m-accent transition-colors"
          >
            Адмін-панель
          </Link>
        </header>

        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-secret-login" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            {/* Динамічний роут для вибору місць */}
            <Route path="/session/:id" element={<Booking />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
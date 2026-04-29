import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Booking from './pages/Booking';
import MovieDetail from './pages/MovieDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-m-black text-white">
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-m-dark sticky top-0 z-50">
          <Link to="/" className="text-xl font-bold text-m-accent tracking-tighter uppercase">
            Multiplex <span className="text-white">Clone</span>
          </Link>
          <Link to="/admin-secret-login" className="text-xs text-gray-600 hover:text-m-accent transition-colors">
            Адмін-панель
          </Link>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-secret-login" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/session/:id" element={<Booking />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
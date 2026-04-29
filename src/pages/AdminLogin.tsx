import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pass === '1234') {
      navigate('/admin-panel');
    } else {
      alert('Невірний пароль!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-m-dark p-8 rounded-2xl shadow-xl w-80 border border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center">Вхід для адміна</h2>
        <input 
          type="password" 
          placeholder="Пароль"
          className="w-full p-3 rounded bg-m-black border border-gray-700 focus:border-m-accent outline-none mb-4"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-m-accent text-black py-3 rounded-lg font-bold hover:brightness-110 transition"
        >
          Увійти
        </button>
      </div>
    </div>
  );
}
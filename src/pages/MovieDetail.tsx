import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { type Movie, type MovieSession } from '../types';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    // Отримуємо дані фільму
    getDoc(doc(db, "movies", id)).then(snap => {
      if (snap.exists()) setMovie({ id: snap.id, ...snap.data() } as Movie);
    });

    // Отримуємо сеанси цього фільму
    const q = query(collection(db, "sessions"), where("movieId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const sData = snap.docs.map(d => ({ id: d.id, ...d.data() } as MovieSession));
      setSessions(sData);
      
      // Встановлюємо першу доступну дату як обрану за замовчуванням
      const dates = [...new Set(sData.map(s => s.date))].sort();
      if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0]);
    });

    return () => unsub();
  }, [id]);

  if (!movie) return <div className="p-20 text-center">Завантаження...</div>;

  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort();

  return (
    <div className="min-h-screen bg-m-black text-white pb-20">
      {/* Hero секція з постером */}
      <div className="relative h-[60vh] w-full">
        <img src={movie.image} className="w-full h-full object-cover opacity-30" alt={movie.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-m-black via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-2xl">
          <h1 className="text-6xl font-black uppercase mb-4 tracking-tighter">{movie.title}</h1>
          <div className="flex gap-4 text-m-accent font-bold uppercase text-sm mb-6">
            <span>{movie.genre}</span>
            <span>•</span>
            <span>{movie.duration}</span>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">{movie.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 mt-10">
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest border-l-4 border-m-accent pl-4">Розклад сеансів</h2>
        
        {/* Таби з датами */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
          {uniqueDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-8 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedDate === date ? 'bg-m-accent text-black scale-105' : 'bg-m-dark text-gray-500 hover:text-white'
              }`}
            >
              {new Date(date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
            </button>
          ))}
        </div>

        {/* Сітка сеансів */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {sessions
            .filter(s => s.date === selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(session => (
              <button
                key={session.id}
                onClick={() => navigate(`/session/${session.id}`)}
                className="bg-m-dark p-6 rounded-3xl border border-gray-800 hover:border-m-accent transition-all group text-center"
              >
                <div className="text-3xl font-black mb-1 group-hover:text-m-accent transition-colors">
                  {session.time}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">
                  {session.hall || "Стандарт"}
                </div>
                <div className="text-m-accent font-bold bg-m-accent/10 py-1 rounded-lg">
                  {session.price} ₴
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
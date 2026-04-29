import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { Movie, MovieSession } from '../types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const navigate = useNavigate();

  // Отримуємо сьогоднішню дату у форматі YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubMovies = onSnapshot(collection(db, "movies"), (snap) => {
      setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie)));
    });
    const unsubSessions = onSnapshot(collection(db, "sessions"), (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MovieSession)));
    });
    return () => { unsubMovies(); unsubSessions(); };
  }, []);

  return (
    <div className="min-h-screen bg-m-black text-white pb-20 pt-10">
      {/* Movie Grid */}
      <div className="max-w-7xl mx-auto px-10 relative z-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Зараз у кіно</h2>
          <div className="text-m-accent font-bold uppercase text-xs tracking-widest border-b-2 border-m-accent cursor-pointer">
            Дивитись всі
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {movies.map(movie => {
            // Фільтруємо сеанси ТІЛЬКИ НА СЬОГОДНІ для цієї картки
            const todaySessions = sessions
              .filter(s => s.movieId === movie.id && s.date === today)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div 
                key={movie.id} 
                className="group cursor-pointer"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <div className="relative aspect-[2/3] rounded-3xl overflow-hidden mb-4 border border-gray-800 transition-all group-hover:border-m-accent group-hover:scale-[1.02] shadow-2xl">
                  <img src={movie.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-4 left-4 bg-m-accent text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    New
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1 truncate group-hover:text-m-accent transition-colors">{movie.title}</h3>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-4">{movie.genre}</p>

                {/* СЕАНСИ НА СЬОГОДНІ */}
                <div className="flex flex-wrap gap-2">
                  {todaySessions.length > 0 ? (
                    todaySessions.map(s => (
                      <div key={s.id} className="bg-m-dark border border-gray-800 text-[10px] font-bold px-2 py-1 rounded-md text-gray-400 group-hover:border-m-accent/30">
                        {s.time}
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-600 uppercase font-bold">Сьогодні сеансів немає</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
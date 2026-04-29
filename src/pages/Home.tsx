import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { Movie, MovieSession } from '../types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    onSnapshot(collection(db, "movies"), (snap) => setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie))));
    onSnapshot(collection(db, "sessions"), (snap) => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MovieSession))));
  }, []);

  return (
    <div className="min-h-screen bg-m-black text-white pb-20 pt-10 px-10">
      <h2 className="text-3xl font-black uppercase mb-8">Зараз у кіно</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {movies.map(movie => {
          const todaySessions = sessions.filter(s => s.movieId === movie.id && s.date === today);
          return (
            <div key={movie.id} className="group cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
              <div className="aspect-[2/3] rounded-3xl overflow-hidden mb-4 border border-gray-800 transition-all group-hover:border-m-accent">
                <img src={movie.image} className="w-full h-full object-cover" alt="" />
              </div>
              <h3 className="text-xl font-bold truncate">{movie.title}</h3>
              <p className="text-gray-500 text-xs uppercase mb-4">{movie.genre}</p>
              <div className="flex flex-wrap gap-2">
                {todaySessions.length > 0 ? todaySessions.map(s => (
                  <div key={s.id} className="bg-m-dark border border-gray-700 px-2 py-1 rounded text-[10px]">{s.time}</div>
                )) : <span className="text-[10px] text-gray-600">Сеансів на сьогодні немає</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
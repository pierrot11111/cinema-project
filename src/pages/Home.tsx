import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { type Movie, type MovieSession } from '../types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const navigate = useNavigate();

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
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {movies.map(movie => {
        const movieSessions = sessions.filter(s => s.movieId === movie.id).slice(0, 3);
        return (
          <div key={movie.id} className="bg-m-dark rounded-2xl overflow-hidden border border-gray-800 hover:border-m-accent transition-all group">
            <div className="relative aspect-[2/3] cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
              <img src={movie.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-3 truncate">{movie.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {movieSessions.map(s => (
                  <button key={s.id} onClick={() => navigate(`/session/${s.id}`)} className="bg-m-black border border-gray-700 px-2 py-1 rounded text-xs hover:text-m-accent">
                    {s.time}
                  </button>
                ))}
              </div>
              <button onClick={() => navigate(`/movie/${movie.id}`)} className="w-full py-2 bg-white text-black rounded-lg font-bold text-sm uppercase">Про фільм</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
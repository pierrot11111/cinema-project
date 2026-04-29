import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import type { MovieSession } from '../types';

export default function Home() {
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MovieSession[];
      
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl font-bold text-m-accent animate-pulse">Завантаження фільмів...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="my-8">
        <h2 className="text-3xl font-bold border-l-4 border-m-accent pl-4 uppercase tracking-wider">
          Зараз у кіно
        </h2>
      </header>

      {sessions.length === 0 ? (
        <div className="bg-m-dark p-10 rounded-2xl text-center border border-gray-800">
          <p className="text-gray-500">Сеансів поки немає. Додайте їх в адмінці.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="group bg-m-dark rounded-2xl overflow-hidden border border-gray-800 hover:border-m-accent transition-all duration-300 shadow-2xl flex flex-col"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={session.image} 
                  alt={session.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-m-accent text-black px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                  {session.price} ГРН
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 truncate">{session.movieTitle}</h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-m-black text-gray-300 px-2 py-1 rounded border border-gray-700 text-[10px] font-medium">
                    📅 {session.date}
                  </span>
                  <span className="bg-m-black text-gray-300 px-2 py-1 rounded border border-gray-700 text-[10px] font-medium">
                    🕒 {session.time}
                  </span>
                  <span className="text-m-accent text-[10px] font-bold self-center ml-auto">
                    {session.hall}
                  </span>
                </div>
                
                <button 
                  className="mt-auto w-full bg-white text-black py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-m-accent transition-colors active:scale-95 duration-150"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  Купити квиток
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
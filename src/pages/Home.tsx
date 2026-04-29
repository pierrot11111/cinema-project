import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Описуємо тип даних для фільму
interface MovieSession {
  id: string;
  movieTitle: string;
  price: number;
  image: string;
  hall: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Підписуємось на оновлення колекції "sessions" в реальному часі
    const unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MovieSession[];
      
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe(); // Відписуємось при закритті сторінки
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-m-accent">Завантаження фільмів...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 border-l-4 border-m-accent pl-4">
        Зараз у кіно
      </h2>

      {sessions.length === 0 ? (
        <div className="text-gray-500">Наразі немає активних сеансів.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sessions.map((session) => (
            <div key={session.id} className="group bg-m-dark rounded-2xl overflow-hidden border border-gray-800 hover:border-m-accent transition-all duration-300 shadow-lg">
              {/* Постер фільму */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={session.image} 
                  alt={session.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-m-accent text-black px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  {session.price} грн
                </div>
              </div>

              {/* Інфо про фільм */}
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1 truncate" title={session.movieTitle}>
                  {session.movieTitle}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{session.hall}</p>
                
                <button 
                  className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-m-accent transition-colors"
                  onClick={() => alert(`Бронювання на "${session.movieTitle}" скоро буде!`)}
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
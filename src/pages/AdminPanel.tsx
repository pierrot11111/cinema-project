import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Movie, MovieSession } from '../types'; //

export default function AdminPanel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showSeatsEditor, setShowSeatsEditor] = useState(false);
  
  const [currentMovie, setCurrentMovie] = useState<Partial<Movie> | null>(null);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<MovieSession | null>(null);

  const [sDate, setSDate] = useState('');
  const [sTime, setSTime] = useState('');
  const [sPrice, setSPrice] = useState('');
  const [sHall, setSHall] = useState('Зал 1');

  useEffect(() => {
    const unsubMovies = onSnapshot(collection(db, "movies"), (snap) => {
      setMovies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Movie)));
    });
    const unsubSessions = onSnapshot(collection(db, "sessions"), (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MovieSession)));
    });
    return () => { unsubMovies(); unsubSessions(); };
  }, []);

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMovie?.title) return;
    if (currentMovie.id) {
      await updateDoc(doc(db, "movies", currentMovie.id), currentMovie);
    } else {
      await addDoc(collection(db, "movies"), { ...currentMovie, duration: "120 хв", genre: "Драма" });
    }
    setShowMovieForm(false);
    setCurrentMovie(null);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMovieId) return;
    const movie = movies.find(m => m.id === activeMovieId);
    await addDoc(collection(db, "sessions"), {
      movieId: activeMovieId,
      movieTitle: movie?.title || "Фільм",
      date: sDate,
      time: sTime,
      price: Number(sPrice),
      hall: sHall,
      bookedSeats: []
    });
    setShowSessionForm(false);
    setSDate(''); setSTime(''); setSPrice('');
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm('Видалити цей сеанс?')) {
      await deleteDoc(doc(db, "sessions", sessionId));
    }
  };

  const toggleSeatAdmin = async (seatIndex: number) => {
    if (!activeSession) return;
    const currentBooked = activeSession.bookedSeats || [];
    const newBooked = currentBooked.includes(seatIndex)
      ? currentBooked.filter(s => s !== seatIndex)
      : [...currentBooked, seatIndex];
    await updateDoc(doc(db, "sessions", activeSession.id), { bookedSeats: newBooked });
    setActiveSession({ ...activeSession, bookedSeats: newBooked });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black uppercase text-m-accent tracking-tighter">Admin Panel</h1>
        <button onClick={() => { setCurrentMovie({}); setShowMovieForm(true); }} className="bg-m-accent text-black px-6 py-3 rounded-xl font-bold uppercase hover:scale-105 transition-transform">
          Додати фільм
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {movies.map(movie => {
          // ГРУПУВАННЯ СЕАНСІВ ПО ДАТАХ ДЛЯ КОЖНОГО ФІЛЬМУ
          const movieSessions = sessions.filter(s => s.movieId === movie.id);
          const groupedByDate: Record<string, MovieSession[]> = {};
          
          movieSessions.forEach(s => {
            if (!groupedByDate[s.date]) groupedByDate[s.date] = [];
            groupedByDate[s.date].push(s);
          });

          const sortedDates = Object.keys(groupedByDate).sort();

          return (
            <div key={movie.id} className="bg-m-dark rounded-3xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden hover:border-gray-600 transition-all">
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold mb-4">{movie.title}</h3>
                
                {/* ВІДОБРАЖЕННЯ ЗГРУПОВАНИХ СЕАНСІВ */}
                <div className="space-y-6 mb-6">
                  {sortedDates.length > 0 ? (
                    sortedDates.map(date => (
                      <div key={date}>
                        <p className="text-[10px] text-m-accent uppercase font-black mb-2 tracking-widest border-b border-m-accent/20 pb-1">
                          📅 {new Date(date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {groupedByDate[date].sort((a, b) => a.time.localeCompare(b.time)).map(s => (
                            <div key={s.id} className="relative group">
                              <button 
                                onClick={() => { setActiveSession(s); setShowSeatsEditor(true); }}
                                className="bg-m-black border border-gray-700 pl-3 pr-9 py-2 rounded-xl text-xs hover:border-m-accent transition-all text-left min-w-[100px]"
                              >
                                <div className="font-bold">{s.time}</div>
                                <div className="opacity-40 text-[9px] uppercase">{s.hall}</div>
                              </button>
                              <button 
                                onClick={(e) => handleDeleteSession(e, s.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-red-600 hover:bg-red-700 rounded-lg p-1 shadow-lg transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-600 italic uppercase font-bold tracking-tighter">Сеансів ще не додано</p>
                  )}
                  
                  <button 
                    onClick={() => { setActiveMovieId(movie.id); setShowSessionForm(true); }}
                    className="w-full py-2 rounded-xl border border-dashed border-gray-600 text-gray-500 hover:text-m-accent hover:border-m-accent transition-all flex items-center justify-center text-xs font-bold uppercase gap-2"
                  >
                    <span>+ Додати сеанс</span>
                  </button>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-2">
                <button onClick={() => { setCurrentMovie(movie); setShowMovieForm(true); }} className="flex-1 bg-gray-800 py-3 rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors uppercase">Змінити</button>
                <button onClick={async () => { if(window.confirm('Видалити фільм?')) await deleteDoc(doc(db, "movies", movie.id)) }} className="flex-1 bg-red-900/10 text-red-500 py-3 rounded-xl text-xs font-bold hover:bg-red-900/30 transition-colors uppercase">Видалити</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* МОДАЛКИ (Movie, Session, Seats) */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveMovie} className="bg-m-dark border border-gray-800 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-m-accent uppercase">Дані фільму</h2>
            <input className="w-full bg-m-black border border-gray-700 p-3 rounded-xl focus:border-m-accent outline-none" placeholder="Назва" value={currentMovie?.title || ''} onChange={e => setCurrentMovie({...currentMovie, title: e.target.value})} required />
            <textarea className="w-full bg-m-black border border-gray-700 p-3 rounded-xl h-32 focus:border-m-accent outline-none" placeholder="Опис" value={currentMovie?.description || ''} onChange={e => setCurrentMovie({...currentMovie, description: e.target.value})} />
            <input className="w-full bg-m-black border border-gray-700 p-3 rounded-xl focus:border-m-accent outline-none" placeholder="URL постера" value={currentMovie?.image || ''} onChange={e => setCurrentMovie({...currentMovie, image: e.target.value})} required />
            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 bg-m-accent text-black font-bold py-3 rounded-xl hover:scale-105 transition-transform">Зберегти</button>
              <button type="button" onClick={() => setShowMovieForm(false)} className="flex-1 bg-gray-800 py-3 rounded-xl uppercase text-xs font-bold">Назад</button>
            </div>
          </form>
        </div>
      )}

      {showSessionForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleAddSession} className="bg-m-dark border border-gray-800 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-m-accent uppercase tracking-tighter">Новий сеанс</h2>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="w-full bg-m-black border border-gray-700 p-3 rounded-xl text-white" value={sDate} onChange={e => setSDate(e.target.value)} required />
              <input type="time" className="w-full bg-m-black border border-gray-700 p-3 rounded-xl text-white" value={sTime} onChange={e => setSTime(e.target.value)} required />
            </div>
            <input type="number" className="w-full bg-m-black border border-gray-700 p-3 rounded-xl text-white" placeholder="Ціна (грн)" value={sPrice} onChange={e => setSPrice(e.target.value)} required />
            <select className="w-full bg-m-black border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-m-accent" value={sHall} onChange={e => setSHall(e.target.value)}>
              <option value="Зал 1">Зал 1 (Standard)</option>
              <option value="Зал 2 (IMAX)">Зал 2 (IMAX)</option>
              <option value="VIP Зал">VIP Зал</option>
            </select>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 bg-m-accent text-black font-bold py-3 rounded-xl hover:scale-105 transition-transform">Додати</button>
              <button type="button" onClick={() => setShowSessionForm(false)} className="flex-1 bg-gray-800 py-3 rounded-xl uppercase text-xs font-bold">Закрити</button>
            </div>
          </form>
        </div>
      )}

      {showSeatsEditor && activeSession && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-m-dark border border-gray-800 p-8 rounded-3xl max-w-xl w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-m-accent uppercase tracking-tighter">{activeSession.movieTitle}</h2>
            <p className="text-gray-500 text-[10px] mb-8 uppercase tracking-[0.3em] font-black">{activeSession.hall} | {activeSession.time} | {new Date(activeSession.date).toLocaleDateString('uk-UA')}</p>
            <div className="grid grid-cols-8 gap-3 mb-8 max-w-sm mx-auto">
              {Array.from({ length: 40 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggleSeatAdmin(i)}
                  className={`h-8 rounded-t-lg transition-all ${activeSession.bookedSeats?.includes(i) ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-gray-700 hover:bg-m-accent/40'}`}
                />
              ))}
            </div>
            <button onClick={() => setShowSeatsEditor(false)} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm">Завершити</button>
          </div>
        </div>
      )}
    </div>
  );
}
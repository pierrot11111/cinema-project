import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { type Movie, type MovieSession } from '../types';

export default function AdminPanel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  
  // Состояния модалок
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showSeatsEditor, setShowSeatsEditor] = useState(false);
  
  // Данные форм
  const [currentMovie, setCurrentMovie] = useState<Partial<Movie> | null>(null);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<MovieSession | null>(null);

  // Поля нового сеанса
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
    if (currentMovie?.id) {
      await updateDoc(doc(db, "movies", currentMovie.id), currentMovie);
    } else {
      await addDoc(collection(db, "movies"), { ...currentMovie, bookedSeats: [] });
    }
    setShowMovieForm(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "sessions"), {
      movieId: activeMovieId,
      date: sDate,
      time: sTime,
      price: Number(sPrice),
      hall: sHall,
      bookedSeats: []
    });
    setShowSessionForm(false);
  };

  // Функция переключения статуса места админом
  const toggleSeatAdmin = async (seatIndex: number) => {
    if (!activeSession) return;
    const currentBooked = activeSession.bookedSeats || [];
    const newBooked = currentBooked.includes(seatIndex)
      ? currentBooked.filter(s => s !== seatIndex)
      : [...currentBooked, seatIndex];

    await updateDoc(doc(db, "sessions", activeSession.id), { bookedSeats: newBooked });
    // Обновляем локальное состояние, чтобы интерфейс сразу среагировал
    setActiveSession({ ...activeSession, bookedSeats: newBooked });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black uppercase">Управління кінотеатром</h1>
        <button onClick={() => { setCurrentMovie({}); setShowMovieForm(true); }} className="bg-m-accent text-black px-6 py-3 rounded-xl font-bold">+ Додати фільм</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {movies.map(movie => (
          <div key={movie.id} className="bg-m-dark rounded-3xl border border-gray-800 overflow-hidden flex flex-col">
            <img src={movie.image} className="h-40 w-full object-cover opacity-40" alt="" />
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-4">{movie.title}</h3>
              
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Активні сеанси (тисніть для місць):</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {sessions.filter(s => s.movieId === movie.id).map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { setActiveSession(s); setShowSeatsEditor(true); }}
                    className="bg-m-black border border-gray-700 px-3 py-1 rounded-lg text-sm hover:border-m-accent text-gray-300"
                  >
                    {s.time}
                  </button>
                ))}
                <button onClick={() => { setActiveMovieId(movie.id); setShowSessionForm(true); }} className="px-3 py-1 rounded-lg text-sm border border-dashed border-gray-600 text-gray-500 hover:text-white">+</button>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
              <button onClick={() => { setCurrentMovie(movie); setShowMovieForm(true); }} className="flex-1 bg-gray-800 py-2 rounded-lg text-sm">Змінити</button>
              <button onClick={async () => { if(confirm('Видалити?')) await deleteDoc(doc(db, "movies", movie.id)) }} className="flex-1 bg-red-900/20 text-red-500 py-2 rounded-lg text-sm">Видалити</button>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка редактирования МЕСТ */}
      {showSeatsEditor && activeSession && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-m-dark border border-gray-800 p-8 rounded-3xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-m-accent uppercase">Редактор місць</h2>
                <p className="text-gray-400 text-sm">{activeSession.date} | {activeSession.time} | {activeSession.hall}</p>
              </div>
              <button onClick={() => setShowSeatsEditor(false)} className="text-gray-500 hover:text-white text-2xl">×</button>
            </div>

            <div className="w-full h-1 bg-gray-800 mb-10 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.05)]"></div>

            <div className="grid grid-cols-8 gap-3 justify-center mb-8">
              {Array.from({ length: 40 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggleSeatAdmin(i)}
                  className={`w-8 h-8 rounded-t-lg transition-colors ${
                    activeSession.bookedSeats?.includes(i) ? 'bg-red-600' : 'bg-gray-700 hover:bg-m-accent/50'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-4 text-xs uppercase font-bold text-gray-500 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Зайнято</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-700 rounded-sm"></div> Вільно</div>
            </div>
          </div>
        </div>
      )}

      {/* Модалки фильма и сеанса (оставляем старые или подключаем те, что были в предыдущем шаге) */}
      {/* ... здесь формы из прошлого сообщения ... */}
    </div>
  );
}
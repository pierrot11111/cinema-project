import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { type MovieSession } from '../types';

export default function Booking() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<MovieSession | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (snap.exists()) {
        setSession({ id: snap.id, ...snap.data() } as MovieSession);
      }
    });
    return () => unsub();
  }, [sessionId]);

  const handleBook = async () => {
    if (!session || selectedSeats.length === 0) return;

    const newBooked = [...(session.bookedSeats || []), ...selectedSeats];
    await updateDoc(doc(db, "sessions", session.id), {
      bookedSeats: newBooked
    });

    alert('Квитки успішно заброньовано!');
    navigate('/');
  };

  if (!session) return <div className="p-20 text-center">Завантаження залу...</div>;

  return (
    <div className="min-h-screen bg-m-black text-white p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Шапка бронювання */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{session.movieTitle}</h2>
          <div className="flex justify-center gap-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-2">📅 {session.date}</span>
            <span className="flex items-center gap-2">🕒 {session.time}</span>
            <span className="text-m-accent border border-m-accent/30 px-3 py-1 rounded-lg">🏛️ {session.hall}</span>
          </div>
        </div>

        {/* Екран */}
        <div className="relative mb-20">
          <div className="w-full h-2 bg-gradient-to-b from-m-accent to-transparent rounded-full blur-sm opacity-50" />
          <div className="text-center text-[10px] text-gray-600 uppercase tracking-[1em] mt-4">Екран</div>
        </div>

        {/* Схема залу (40 місць: 5 рядів по 8) */}
        <div className="grid grid-cols-8 gap-4 max-w-md mx-auto mb-16">
          {Array.from({ length: 40 }).map((_, i) => {
            const isBooked = session.bookedSeats?.includes(i);
            const isSelected = selectedSeats.includes(i);

            return (
              <button
                key={i}
                disabled={isBooked}
                onClick={() => {
                  setSelectedSeats(prev => 
                    prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
                  );
                }}
                className={`h-10 rounded-t-xl transition-all ${
                  isBooked ? 'bg-red-900/40 cursor-not-allowed' : 
                  isSelected ? 'bg-m-accent scale-110 shadow-[0_0_15px_rgba(226,254,0,0.5)]' : 
                  'bg-gray-800 hover:bg-gray-700'
                }`}
              />
            );
          })}
        </div>

        {/* Легенда та підсумок */}
        <div className="bg-m-dark p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-6 text-xs uppercase font-bold tracking-widest">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 rounded-sm"></div> Вільно</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-m-accent rounded-sm"></div> Ваше місце</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-900/40 rounded-sm"></div> Зайнято</div>
          </div>

          <div className="text-right">
            <p className="text-gray-500 uppercase text-[10px] font-bold mb-1">До сплати</p>
            <h3 className="text-4xl font-black text-m-accent">
              {selectedSeats.length * session.price} ₴
            </h3>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={handleBook}
            className={`px-12 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all ${
              selectedSeats.length > 0 
              ? 'bg-m-accent text-black hover:scale-105 active:scale-95' 
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Купити квитки
          </button>
        </div>
      </div>
    </div>
  );
}
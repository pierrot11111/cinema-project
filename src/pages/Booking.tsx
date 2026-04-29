import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { MovieSession } from '../types';

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<MovieSession | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "sessions", id), (snap) => {
      if (snap.exists()) {
        setSession({ id: snap.id, ...snap.data() } as MovieSession);
      }
    });

    return () => unsub();
  }, [id]);

  // Функция для выбора/отмены места (использует setSelectedSeats)
  const toggleSeat = (index: number) => {
    if (session?.bookedSeats?.includes(index)) return;
    
    setSelectedSeats(prev => 
      prev.includes(index) ? prev.filter(s => s !== index) : [...prev, index]
    );
  };

  // Главная функция бронирования
  const handleBooking = async () => {
    if (!session || selectedSeats.length === 0) return;

    const newBookedSeats = [...(session.bookedSeats || []), ...selectedSeats];
    
    try {
      await updateDoc(doc(db, "sessions", session.id), {
        bookedSeats: newBookedSeats
      });
      
      alert(`Успішно заброньовано! Місця: ${selectedSeats.map(s => s + 1).join(', ')}`);
      navigate('/');
    } catch (error) {
      console.error("Ошибка бронирования:", error);
      alert("Помилка при купівлі квитків.");
    }
  };

  if (!session) {
    return <div className="p-20 text-center text-white">Завантаження залу...</div>;
  }

  return (
    <div className="min-h-screen bg-m-black text-white pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase mb-2">{session.movieTitle}</h1>
          <p className="text-m-accent font-bold uppercase tracking-widest text-sm italic">
            {session.hall} • {session.date} • {session.time}
          </p>
        </div>

        {/* Экран */}
        <div className="relative mb-16">
          <div className="h-2 bg-gradient-to-b from-m-accent/50 to-transparent rounded-full blur-sm mb-4" />
          <div className="text-center text-[10px] text-gray-600 uppercase font-bold tracking-[0.5em]">Екран</div>
        </div>

        {/* Сетка мест (использует toggleSeat и setSelectedSeats через неё) */}
        <div className="grid grid-cols-8 gap-3 mb-12 max-w-md mx-auto">
          {Array.from({ length: 40 }).map((_, i) => {
            const isBooked = session.bookedSeats?.includes(i);
            const isSelected = selectedSeats.includes(i);

            return (
              <button
                key={i}
                disabled={isBooked}
                onClick={() => toggleSeat(i)}
                className={`
                  aspect-square rounded-t-lg transition-all duration-300
                  ${isBooked ? 'bg-gray-800 cursor-not-allowed' : 
                    isSelected ? 'bg-m-accent scale-110 shadow-[0_0_15px_rgba(255,255,0,0.4)]' : 
                    'bg-gray-700 hover:bg-gray-600'}
                `}
              />
            );
          })}
        </div>

        {/* Панель оплаты (использует handleBooking) */}
        <div className="bg-m-dark border border-gray-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Обрано місць: {selectedSeats.length}</p>
            <p className="text-3xl font-black tracking-tighter">
              {selectedSeats.length * session.price} <span className="text-sm text-m-accent font-bold">UAH</span>
            </p>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`
              px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
              ${selectedSeats.length > 0 
                ? 'bg-m-accent text-black hover:scale-105 active:scale-95' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
            `}
          >
            Купити квиток
          </button>
        </div>
      </div>
    </div>
  );
}
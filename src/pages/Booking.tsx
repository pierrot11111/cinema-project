import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { type MovieSession } from '../types';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSessions] = useState<MovieSession | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Эмуляция мест в зале (например, 40 мест)
  const totalSeats = 40;

  useEffect(() => {
    if (!id) return;
    
    // Получаем данные о сеансе и забронированных местах в реальном времени
    const unsubscribe = onSnapshot(doc(db, "sessions", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as MovieSession;
        setSessions(data);
        setBookedSeats(docSnap.data().bookedSeats || []);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const toggleSeat = (seatIndex: number) => {
    if (bookedSeats.includes(seatIndex)) return;
    setSelectedSeats(prev => 
      prev.includes(seatIndex) ? prev.filter(s => s !== seatIndex) : [...prev, seatIndex]
    );
  };

  const handleBuy = async () => {
    if (selectedSeats.length === 0 || !id) return;
    
    const newBookedSeats = [...bookedSeats, ...selectedSeats];
    try {
      await updateDoc(doc(db, "sessions", id), {
        bookedSeats: newBookedSeats
      });
      alert("Квитки успішно куплені!");
      setSelectedSeats([]);
      navigate('/');
    } catch (error) {
      alert("Помилка при купівлі");
    }
  };

  if (!session) return <div className="p-10 text-center">Завантаження...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-m-accent uppercase">{session.movieTitle}</h2>
        <p className="text-gray-400">{session.date} о {session.time} — {session.hall}</p>
      </div>

      {/* Экран */}
      <div className="w-full h-2 bg-gray-700 rounded-full mb-12 shadow-[0_15px_30px_rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-[0.5em]">
        Екран
      </div>

      {/* Сетка мест */}
      <div className="grid grid-cols-8 gap-3 mb-10">
        {Array.from({ length: totalSeats }).map((_, i) => {
          const isBooked = bookedSeats.includes(i);
          const isSelected = selectedSeats.includes(i);
          
          return (
            <button
              key={i}
              onClick={() => toggleSeat(i)}
              disabled={isBooked}
              className={`w-8 h-8 rounded-t-lg transition-all ${
                isBooked ? 'bg-gray-800 cursor-not-allowed' : 
                isSelected ? 'bg-m-accent scale-110 shadow-lg' : 'bg-gray-600 hover:bg-gray-400'
              }`}
              title={`Місце ${i + 1}`}
            />
          );
        })}
      </div>

      {/* Панель оплаты */}
      <div className="w-full bg-m-dark p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">Обрано місць: {selectedSeats.length}</p>
          <p className="text-2xl font-bold">{selectedSeats.length * session.price} ГРН</p>
        </div>
        <button 
          onClick={handleBuy}
          disabled={selectedSeats.length === 0}
          className="bg-m-accent text-black px-8 py-3 rounded-xl font-black uppercase disabled:opacity-50 disabled:grayscale"
        >
          Купити квитки
        </button>
      </div>
    </div>
  );
}
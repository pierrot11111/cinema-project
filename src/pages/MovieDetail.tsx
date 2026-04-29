import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { type Movie, type MovieSession } from '../types';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "movies", id)).then(d => d.exists() && setMovie({ id: d.id, ...d.data() } as Movie));
    
    const q = query(collection(db, "sessions"), where("movieId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MovieSession));
      setSessions(data);
      if (data.length > 0) setSelectedDate(data[0].date);
    });
    return () => unsub();
  }, [id]);

  const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort();

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row gap-12">
      <img src={movie?.image} className="w-full md:w-96 rounded-3xl shadow-2xl" alt="" />
      <div className="flex-1">
        <h1 className="text-5xl font-black mb-4 uppercase">{movie?.title}</h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">{movie?.description}</p>
        
        <div className="flex gap-6 mb-8 border-b border-gray-800">
          {uniqueDates.map(date => (
            <button key={date} onClick={() => setSelectedDate(date)} className={`pb-4 px-2 font-bold ${selectedDate === date ? 'border-b-2 border-m-accent text-m-accent' : 'text-gray-500'}`}>
              {date}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {sessions.filter(s => s.date === selectedDate).map(s => (
            <button key={s.id} onClick={() => navigate(`/session/${s.id}`)} className="bg-m-dark p-4 rounded-2xl border border-gray-800 hover:border-m-accent transition-all text-center">
              <div className="text-2xl font-black">{s.time}</div>
              <div className="text-xs text-gray-500 uppercase mt-1">{s.hall}</div>
              <div className="text-m-accent font-bold mt-2">{s.price} грн</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { MovieSession } from '../types';

export default function AdminPanel() {
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hall, setHall] = useState('Зал 1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Завантаження сеансів
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MovieSession[];
      setSessions(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionData = {
      movieTitle: title,
      price: Number(price),
      image: imageUrl || "https://via.placeholder.com/300x450?text=No+Poster",
      hall,
      date,
      time,
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "sessions", editId), sessionData);
        setEditId(null);
      } else {
        await addDoc(collection(db, "sessions"), sessionData);
      }
      resetForm();
    } catch (err) {
      alert("Помилка при збереженні!");
    }
  };

  const resetForm = () => {
    setTitle(''); setPrice(''); setImageUrl(''); setDate(''); setTime(''); setEditId(null);
  };

  const handleEdit = (s: MovieSession) => {
    setEditId(s.id);
    setTitle(s.movieTitle);
    setPrice(String(s.price));
    setImageUrl(s.image);
    setHall(s.hall);
    setDate(s.date);
    setTime(s.time);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Видалити цей сеанс?")) {
      await deleteDoc(doc(db, "sessions", id));
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ФОРМА ДОДАВАННЯ/РЕДАГУВАННЯ */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="sticky top-4 bg-m-dark p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-m-accent">
            {editId ? "Редагувати сеанс" : "Новий сеанс"}
          </h2>
          
          <input className="w-full p-2 rounded bg-m-black border border-gray-700" placeholder="Назва фільму" value={title} onChange={e => setTitle(e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-2">
            <input className="p-2 rounded bg-m-black border border-gray-700" type="number" placeholder="Ціна" value={price} onChange={e => setPrice(e.target.value)} required />
            <select className="p-2 rounded bg-m-black border border-gray-700" value={hall} onChange={e => setHall(e.target.value)}>
              <option>Зал 1</option>
              <option>Зал 2 (IMAX)</option>
              <option>VIP Зал</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input className="p-2 rounded bg-m-black border border-gray-700 text-sm" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <input className="p-2 rounded bg-m-black border border-gray-700 text-sm" type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </div>

          <input className="w-full p-2 rounded bg-m-black border border-gray-700" placeholder="URL постера" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />

          <button className="w-full bg-m-accent text-black font-bold py-2 rounded-xl hover:brightness-110">
            {editId ? "Оновити" : "Додати сеанс"}
          </button>
          {editId && <button type="button" onClick={resetForm} className="w-full text-gray-400 text-sm">Скасувати</button>}
        </form>
      </div>

      {/* СПИСОК СЕАНСІВ */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-4">Активні сеанси</h2>
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-m-dark p-4 rounded-xl border border-gray-800 flex items-center gap-4">
              <img src={s.image} className="w-16 h-20 object-cover rounded" alt="" />
              <div className="flex-1">
                <h3 className="font-bold">{s.movieTitle}</h3>
                <p className="text-xs text-gray-400">{s.date} | {s.time} | {s.hall}</p>
                <p className="text-m-accent font-bold">{s.price} грн</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEdit(s)} className="text-blue-400 text-sm hover:underline">Змінити</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 text-sm hover:underline">Видалити</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
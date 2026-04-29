import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return alert("Заповніть назву та ціну!");

    try {
      await addDoc(collection(db, "sessions"), {
        movieTitle: title,
        price: Number(price),
        image: imageUrl || "https://via.placeholder.com/300x450?text=No+Poster",
        date: new Date().toISOString(),
        hall: "Зал 1"
      });
      alert("Сеанс успішно додано!");
      setTitle('');
      setPrice('');
      setImageUrl('');
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
      alert("Помилка при збереженні!");
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-m-accent">Додати новий сеанс</h2>
      <form onSubmit={handleAddSession} className="space-y-4 bg-m-dark p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Назва фільму</label>
          <input 
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-m-black border border-gray-700 focus:border-m-accent outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-400">Ціна квитка (грн)</label>
          <input 
            type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-m-black border border-gray-700 focus:border-m-accent outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-400">URL постера (посилання на картинку)</label>
          <input 
            type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 rounded bg-m-black border border-gray-700 focus:border-m-accent outline-none"
          />
        </div>
        <button type="submit" className="w-full bg-m-accent text-black py-2 rounded-lg font-bold hover:bg-yellow-500">
          Зберегти в базу
        </button>
      </form>
    </div>
  );
}
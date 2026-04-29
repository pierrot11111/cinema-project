export default function Home() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-m-accent mb-6">Зараз у кіно</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Тут будуть картки фільмів у стилі Multiplex */}
        <div className="bg-m-dark p-4 rounded-xl border border-gray-800">
          <div className="aspect-[2/3] bg-gray-700 rounded-lg mb-4 flex items-center justify-center text-gray-500">
            Постер
          </div>
          <h3 className="font-bold">Назва фільму</h3>
          <button className="mt-4 w-full bg-m-accent text-black py-2 rounded-lg font-bold">
            Квитки
          </button>
        </div>
      </div>
    </div>
  );
}
export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string; // наприклад, "120 хв"
  genre: string;
}

export interface MovieSession {
  id: string;
  movieId: string; // Зв'язок з фільмом
  date: string;    // 2024-05-20
  time: string;    // 19:30
  hall: string;
  price: number;
  bookedSeats: number[];
}
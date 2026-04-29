export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;         // Будет храниться как "120 хв"
  language: string;         // "Українська" или "Англійська"
  rating: string;           // Рейтинг IMDb
  genre: string;            // Жанр
  ageRestriction: string;   // "16+", "18+" и т.д.
}

export interface MovieSession {
  id: string;
  movieId: string;
  movieTitle: string; 
  date: string;
  time: string;
  hall: string;
  price: number;
  bookedSeats: number[];
}
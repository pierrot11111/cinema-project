export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  genre: string;
}

export interface MovieSession {
  id: string;
  movieId: string;
  movieTitle: string; 
  date: string;
  time: string;
  hall: string; // Додано поле залу
  price: number;
  bookedSeats: number[];
}
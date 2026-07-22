export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  popularity: number;
};

export type MoviesApiResponse =
  | { movies: Movie[] }
  | { error: string };

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
};

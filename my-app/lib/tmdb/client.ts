import type { Movie } from "@/lib/movies/types";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
};

type TmdbVideo = {
  key: string;
  official: boolean;
  site: string;
  type: string;
};

function isTmdbMovie(value: unknown): value is TmdbMovie {
  if (typeof value !== "object" || value === null) return false;

  return (
    "id" in value &&
    typeof value.id === "number" &&
    "title" in value &&
    typeof value.title === "string" &&
    "overview" in value &&
    typeof value.overview === "string" &&
    "poster_path" in value &&
    (typeof value.poster_path === "string" || value.poster_path === null) &&
    "backdrop_path" in value &&
    (typeof value.backdrop_path === "string" || value.backdrop_path === null) &&
    "release_date" in value &&
    typeof value.release_date === "string" &&
    "vote_average" in value &&
    typeof value.vote_average === "number" &&
    "popularity" in value &&
    typeof value.popularity === "number"
  );
}

function readMovies(value: unknown): Movie[] {
  if (typeof value !== "object" || value === null || !("results" in value)) {
    throw new Error("TMDB 응답 형식이 올바르지 않습니다.");
  }

  if (!Array.isArray(value.results) || !value.results.every(isTmdbMovie)) {
    throw new Error("TMDB 영화 목록 형식이 올바르지 않습니다.");
  }

  return value.results.map(toMovie);
}

function toMovie(movie: TmdbMovie): Movie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    popularity: movie.popularity,
  };
}

function isTmdbVideo(value: unknown): value is TmdbVideo {
  if (typeof value !== "object" || value === null) return false;

  return (
    "key" in value &&
    typeof value.key === "string" &&
    "official" in value &&
    typeof value.official === "boolean" &&
    "site" in value &&
    typeof value.site === "string" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function readYoutubeTrailer(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("results" in value)) {
    throw new Error("TMDB 영상 응답 형식이 올바르지 않습니다.");
  }

  if (!Array.isArray(value.results) || !value.results.every(isTmdbVideo)) {
    throw new Error("TMDB 영상 목록 형식이 올바르지 않습니다.");
  }

  const youtubeVideos = value.results.filter((video) => video.site === "YouTube");
  const trailer =
    youtubeVideos.find((video) => video.type === "Trailer" && video.official) ??
    youtubeVideos.find((video) => video.type === "Trailer") ??
    youtubeVideos.find((video) => video.type === "Teaser" && video.official) ??
    youtubeVideos[0];

  return trailer?.key ?? null;
}

async function fetchTrailerForLanguage(
  movieId: number,
  apiKey: string,
  language: string,
): Promise<string | null> {
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/videos`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", language);

  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`TMDB 영상 요청에 실패했습니다. (상태 코드: ${response.status})`);
  }

  const data: unknown = await response.json();
  return readYoutubeTrailer(data);
}

export async function fetchPopularMovies(apiKey: string): Promise<Movie[]> {
  return fetchMovieList("movie/popular", apiKey);
}

export async function fetchUpcomingMovies(apiKey: string): Promise<Movie[]> {
  return fetchMovieList("movie/upcoming", apiKey, "KR");
}

async function fetchMovieList(
  path: string,
  apiKey: string,
  region?: string,
): Promise<Movie[]> {
  const url = new URL(`${TMDB_API_BASE_URL}/${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ko-KR");
  url.searchParams.set("page", "1");
  if (region) url.searchParams.set("region", region);

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`TMDB 목록 요청에 실패했습니다. (상태 코드: ${response.status})`);
  }

  const data: unknown = await response.json();
  return readMovies(data);
}

export async function fetchMovieDetails(
  movieId: number,
  apiKey: string,
): Promise<Movie | null> {
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ko-KR");

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`TMDB 상세 요청에 실패했습니다. (상태 코드: ${response.status})`);
  }

  const data: unknown = await response.json();
  if (!isTmdbMovie(data)) {
    throw new Error("TMDB 영화 상세 형식이 올바르지 않습니다.");
  }

  return toMovie(data);
}

export async function fetchMovieTrailer(
  movieId: number,
  apiKey: string,
): Promise<string | null> {
  const koreanTrailer = await fetchTrailerForLanguage(movieId, apiKey, "ko-KR");
  if (koreanTrailer) return koreanTrailer;

  return fetchTrailerForLanguage(movieId, apiKey, "en-US");
}

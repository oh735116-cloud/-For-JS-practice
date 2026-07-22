import { fetchPopularMovies } from "@/lib/tmdb/client";
import type { MoviesApiResponse } from "@/lib/movies/types";

export async function GET(): Promise<Response> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "TMDB_API_KEY가 설정되지 않았습니다." } satisfies MoviesApiResponse,
      { status: 503 },
    );
  }

  try {
    const movies = await fetchPopularMovies(apiKey);
    return Response.json({ movies } satisfies MoviesApiResponse);
  } catch (error) {
    console.error("TMDB API request failed", error);
    return Response.json(
      { error: "영화 정보를 가져오지 못했습니다." } satisfies MoviesApiResponse,
      { status: 502 },
    );
  }
}

import type { CastMember } from "@/lib/movies/types";

const MAX_CAST_MEMBERS = 12;

type TmdbCastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

function isTmdbCastMember(value: unknown): value is TmdbCastMember {
  if (typeof value !== "object" || value === null) return false;

  return (
    "id" in value &&
    typeof value.id === "number" &&
    "name" in value &&
    typeof value.name === "string" &&
    "character" in value &&
    typeof value.character === "string" &&
    "profile_path" in value &&
    (typeof value.profile_path === "string" || value.profile_path === null) &&
    "order" in value &&
    typeof value.order === "number"
  );
}

function readCast(value: unknown): CastMember[] {
  if (typeof value !== "object" || value === null || !("cast" in value)) {
    throw new Error("TMDB 출연진 응답 형식이 올바르지 않습니다.");
  }

  if (!Array.isArray(value.cast) || !value.cast.every(isTmdbCastMember)) {
    throw new Error("TMDB 출연진 목록 형식이 올바르지 않습니다.");
  }

  return [...value.cast]
    .sort((firstMember, secondMember) => firstMember.order - secondMember.order)
    .slice(0, MAX_CAST_MEMBERS)
    .map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character,
      profilePath: member.profile_path,
      order: member.order,
    }));
}

export async function fetchMovieCast(
  movieId: number,
  apiKey: string,
): Promise<CastMember[]> {
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/credits`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ko-KR");

  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`TMDB 출연진 요청에 실패했습니다. (상태 코드: ${response.status})`);
  }

  const data: unknown = await response.json();
  return readCast(data);
}

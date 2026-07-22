import Image from "next/image";
import Link from "next/link";
import { fetchUpcomingMovies } from "@/lib/tmdb/client";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

function getTodayInKorea(now: Date): string {
  return new Date(now.getTime() + KOREA_TIME_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

export default async function UpcomingPage() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY가 설정되지 않았습니다.");

  const today = getTodayInKorea(new Date());
  const movies = await fetchUpcomingMovies(apiKey);
  const upcomingMovies = movies
    .filter(
      (movie) =>
        ISO_DATE_PATTERN.test(movie.releaseDate) && movie.releaseDate >= today,
    )
    .sort((firstMovie, secondMovie) =>
      firstMovie.releaseDate.localeCompare(secondMovie.releaseDate),
    );

  return (
    <main className={styles.main}>
      <header className={styles.heading}>
        <p>COMING SOON</p>
        <h1>개봉 예정 영화</h1>
        <span>{today} 이후 국내 개봉 예정 영화를 보여드립니다.</span>
      </header>

      {upcomingMovies.length === 0 ? (
        <p className={styles.notice}>현재 표시할 개봉 예정 영화가 없습니다.</p>
      ) : (
        <section className={styles.grid} aria-label="개봉 예정 영화 목록">
          {upcomingMovies.map((movie) => (
            <Link
              className={styles.card}
              href={`/movies/${movie.id}`}
              key={movie.id}
              aria-label={`${movie.title} 상세보기`}
            >
              <div className={styles.poster}>
                {movie.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                    alt={`${movie.title} 포스터`}
                    fill
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 20vw"
                  />
                ) : (
                  <span>포스터 없음</span>
                )}
                <time className={styles.releaseDate} dateTime={movie.releaseDate}>
                  {movie.releaseDate}
                </time>
              </div>
              <h2>{movie.title}</h2>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}

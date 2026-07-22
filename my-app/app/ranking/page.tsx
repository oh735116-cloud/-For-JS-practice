import Image from "next/image";
import Link from "next/link";
import { fetchPopularMovies } from "@/lib/tmdb/client";
import styles from "./page.module.css";

export default async function RankingPage() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY가 설정되지 않았습니다.");

  const movies = await fetchPopularMovies(apiKey);
  const rankedMovies = [...movies].sort(
    (firstMovie, secondMovie) => secondMovie.popularity - firstMovie.popularity,
  );

  return (
    <main className={styles.main}>
      <header className={styles.heading}>
        <p>POPULARITY RANKING</p>
        <h1>인기 순위</h1>
        <span>TMDB 인기도 수치가 높은 영화부터 보여드립니다.</span>
      </header>

      {rankedMovies.length === 0 ? (
        <p className={styles.notice}>표시할 영화가 없습니다.</p>
      ) : (
        <ol className={styles.ranking}>
          {rankedMovies.map((movie, index) => (
            <li key={movie.id}>
              <Link className={styles.card} href={`/movies/${movie.id}`}>
                <strong className={styles.rank} aria-label={`${index + 1}위`}>
                  {index + 1}
                </strong>

                <div className={styles.poster}>
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={`${movie.title} 포스터`}
                      fill
                      sizes="96px"
                    />
                  ) : (
                    <span>포스터 없음</span>
                  )}
                </div>

                <div className={styles.info}>
                  <h2>{movie.title}</h2>
                  <div className={styles.metadata}>
                    <span>인기도 {movie.popularity.toFixed(1)}</span>
                    <span>평점 {movie.voteAverage.toFixed(1)}</span>
                    <span>{movie.releaseDate || "개봉일 미정"}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

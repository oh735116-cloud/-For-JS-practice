import Image from "next/image";
import Link from "next/link";
import { fetchPopularMovies } from "@/lib/tmdb/client";
import styles from "./page.module.css";

const FEATURED_MOVIE_COUNT = 5;

export default async function MoviesPage() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY가 설정되지 않았습니다.");

  const movies = (await fetchPopularMovies(apiKey)).slice(
    0,
    FEATURED_MOVIE_COUNT,
  );
  const [featuredMovie, ...screeningMovies] = movies;

  if (!featuredMovie) {
    return (
      <main className={styles.main}>
        <p className={styles.notice}>현재 소개할 영화가 없습니다.</p>
      </main>
    );
  }

  const featuredBackground =
    featuredMovie.backdropPath ?? featuredMovie.posterPath;

  return (
    <main className={styles.main}>
      <div className={styles.curtain} aria-hidden="true" />

      <header className={styles.marquee}>
        <p>WELCOME TO</p>
        <h1>MOVIE PICK CINEMA</h1>
        <span>오늘의 영화를 상영합니다</span>
      </header>

      <section className={styles.theater} aria-labelledby="featured-title">
        <p className={styles.screenLabel}>SCREEN 01 · FEATURED</p>
        <div className={styles.screen}>
          {featuredBackground ? (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${featuredBackground}`}
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          ) : (
            <div className={styles.screenFallback} />
          )}
          <div className={styles.screenShade} />

          <div className={styles.featuredContent}>
            <p>NOW SHOWING</p>
            <h2 id="featured-title">{featuredMovie.title}</h2>
            <div className={styles.metadata}>
              <strong>평점 {featuredMovie.voteAverage.toFixed(1)}</strong>
              <span>{featuredMovie.releaseDate || "개봉일 미정"}</span>
            </div>
            <p className={styles.overview}>
              {featuredMovie.overview || "영화 소개가 없습니다."}
            </p>
            <Link
              className={styles.ticketButton}
              href={`/movies/${featuredMovie.id}`}
            >
              상세 정보 보기
            </Link>
          </div>
        </div>
        <div className={styles.seats} aria-hidden="true" />
      </section>

      {screeningMovies.length > 0 && (
        <section className={styles.lineup} aria-labelledby="lineup-title">
          <div className={styles.sectionHeading}>
            <p>SCREENING NOW</p>
            <h2 id="lineup-title">현재 상영작</h2>
          </div>

          <div className={styles.posterGrid}>
            {screeningMovies.map((movie, index) => (
              <Link
                className={styles.movieCard}
                href={`/movies/${movie.id}`}
                key={movie.id}
              >
                <div className={styles.poster}>
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={`${movie.title} 포스터`}
                      fill
                      sizes="(max-width: 600px) 50vw, 25vw"
                    />
                  ) : (
                    <span>포스터 없음</span>
                  )}
                  <span className={styles.screenNumber}>
                    SCREEN {String(index + 2).padStart(2, "0")}
                  </span>
                </div>
                <h3>{movie.title}</h3>
                <p>{movie.releaseDate || "개봉일 미정"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

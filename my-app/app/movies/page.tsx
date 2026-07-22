"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Movie, MoviesApiResponse } from "@/lib/movies/types";
import styles from "./page.module.css";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");

  const filteredMovies = useMemo(() => {
    const normalizedSearchTitle = searchTitle.trim().toLocaleLowerCase("ko-KR");
    if (!normalizedSearchTitle) return movies;

    return movies.filter((movie) =>
      movie.title.toLocaleLowerCase("ko-KR").includes(normalizedSearchTitle),
    );
  }, [movies, searchTitle]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      try {
        const response = await fetch("/api/movies", {
          signal: controller.signal,
        });
        const data: MoviesApiResponse = await response.json();

        if (!response.ok || "error" in data) {
          throw new Error(
            "error" in data ? data.error : "영화 정보를 불러오지 못했습니다.",
          );
        }

        setMovies(data.movies);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadMovies();
    return () => controller.abort();
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>NOW PLAYING</p>
        <h1>팝콘먹고싶다</h1>
        <p>TMDB에서 현재 인기 있는 팝콘을 가져옵니다.</p>
      </header>

      <div className={styles.search}>
        <label htmlFor="movie-title-search">영화 제목 검색</label>
        <input
          id="movie-title-search"
          type="search"
          value={searchTitle}
          onChange={(event) => setSearchTitle(event.target.value)}
          placeholder="영화 제목을 입력하세요"
          autoComplete="off"
        />
      </div>

      {isLoading && <p className={styles.notice}>영화 정보를 불러오는 중입니다…</p>}
      {error && <p className={`${styles.notice} ${styles.error}`}>{error}</p>}
      {!isLoading && !error && movies.length === 0 && (
        <p className={styles.notice}>표시할 영화가 없습니다.</p>
      )}
      {!isLoading && !error && movies.length > 0 && filteredMovies.length === 0 && (
        <p className={styles.notice}>“{searchTitle.trim()}” 검색 결과가 없습니다.</p>
      )}

      <section className={styles.grid} aria-label="인기 영화 목록">
        {filteredMovies.map((movie) => (
          <Link
            className={styles.card}
            key={movie.id}
            href={`/movies/${movie.id}`}
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
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

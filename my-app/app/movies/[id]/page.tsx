import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchMovieCast } from "@/lib/tmdb/cast";
import { fetchMovieDetails, fetchMovieTrailer } from "@/lib/tmdb/client";
import BackButton from "./BackButton";
import styles from "./page.module.css";

type MovieDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isSafeInteger(movieId) || movieId <= 0) notFound();

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY가 설정되지 않았습니다.");

  const movie = await fetchMovieDetails(movieId, apiKey);
  if (!movie) notFound();

  const [trailerKey, cast] = await Promise.all([
    fetchMovieTrailer(movieId, apiKey),
    fetchMovieCast(movieId, apiKey),
  ]);
  const backgroundPath = movie.backdropPath ?? movie.posterPath;

  return (
    <main className={styles.main}>
      <BackButton className={styles.backLink} />

      <article className={styles.detail}>
        <div className={styles.hero}>
          {trailerKey ? (
            <iframe
              className={styles.trailer}
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&rel=0`}
              title={`${movie.title} 예고편`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : backgroundPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${backgroundPath}`}
              alt=""
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className={styles.heroFallback} />
          )}
          {!trailerKey && <div className={styles.heroShade} />}
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>MOVIE DETAIL</p>
          <h1>{movie.title}</h1>
          <div className={styles.metadata}>
            <strong>평점 {movie.voteAverage.toFixed(1)}</strong>
            <span>{movie.releaseDate || "개봉일 미정"}</span>
          </div>
          <p className={styles.overview}>
            {movie.overview || "영화 소개가 없습니다."}
          </p>
          {!trailerKey && (
            <p className={styles.trailerNotice}>등록된 예고편이 없습니다.</p>
          )}

          <section
            className={styles.castSection}
            aria-labelledby="cast-heading"
          >
            <h2 id="cast-heading">주요 출연진</h2>
            {cast.length === 0 ? (
              <p className={styles.castEmpty}>등록된 출연진 정보가 없습니다.</p>
            ) : (
              <ul className={styles.castGrid}>
                {cast.map((member) => (
                  <li
                    className={styles.castCard}
                    key={`${member.id}-${member.order}`}
                  >
                    <div className={styles.profile}>
                      {member.profilePath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${member.profilePath}`}
                          alt={`${member.name} 프로필`}
                          fill
                          sizes="(max-width: 600px) 40vw, 150px"
                        />
                      ) : (
                        <span>사진 없음</span>
                      )}
                    </div>
                    <strong>{member.name}</strong>
                    <span>{member.character || "배역 정보 없음"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}

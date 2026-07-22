import styles from "./page.module.css";

export default function MoviesLoading() {
  return (
    <main className={styles.main}>
      <p className={styles.notice}>오늘의 상영작을 준비하고 있습니다…</p>
    </main>
  );
}

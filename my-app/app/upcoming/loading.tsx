import styles from "./page.module.css";

export default function UpcomingLoading() {
  return (
    <main className={styles.main}>
      <p className={styles.notice}>개봉 예정 영화를 불러오는 중입니다…</p>
    </main>
  );
}

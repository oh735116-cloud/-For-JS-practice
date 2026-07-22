import styles from "./page.module.css";

export default function RankingLoading() {
  return (
    <main className={styles.main}>
      <p className={styles.notice}>인기 순위를 불러오는 중입니다…</p>
    </main>
  );
}

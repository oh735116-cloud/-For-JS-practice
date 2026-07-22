import styles from "./page.module.css";

export default function MovieDetailLoading() {
  return (
    <main className={styles.main}>
      <p>영화 상세 정보를 불러오는 중입니다…</p>
    </main>
  );
}

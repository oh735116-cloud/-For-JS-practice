import Link from "next/link";
import styles from "./page.module.css";

export default function MovieNotFound() {
  return (
    <main className={styles.main}>
      <h1>영화를 찾을 수 없습니다.</h1>
      <Link className={styles.backLink} href="/">
        ← 영화 목록으로 돌아가기
      </Link>
    </main>
  );
}

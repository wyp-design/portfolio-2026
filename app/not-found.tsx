import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found grid-surface">
      <span>404 / LOST IN THE GRID</span>
      <h1>这页走丢了。<br />This page wandered off.</h1>
      <Link href="/">← 回到首页 / Home</Link>
    </main>
  );
}


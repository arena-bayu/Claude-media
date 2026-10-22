import Link from "next/link";
import type { Post } from "./posts";

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <>
      {posts.map((p) => (
        <article key={p.slug} style={{ margin: "24px 0" }}>
          <small>{p.category} · {p.date}</small>
          <h2 style={{ margin: "4px 0" }}><Link href={`/posts/${p.slug}`}>{p.title}</Link></h2>
          <p>{p.summary}</p>
        </article>
      ))}
    </>
  );
}

import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/posts";

export const generateStaticParams = () => getAllPosts().map((p) => ({ slug: p.slug }));

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  return (
    <article>
      <small>{post.category} · {post.date}</small>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

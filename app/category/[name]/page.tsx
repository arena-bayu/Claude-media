import PostList from "@/lib/PostList";
import { getAllPosts, getCategories } from "@/lib/posts";

export const generateStaticParams = () => getCategories().map((name) => ({ name }));

export default function Category({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  return (
    <>
      <h1>{name}</h1>
      <PostList posts={getAllPosts().filter((p) => p.category === name)} />
    </>
  );
}

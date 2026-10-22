import PostList from "@/lib/PostList";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  return <PostList posts={getAllPosts()} />;
}

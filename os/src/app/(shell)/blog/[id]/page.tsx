import { notFound } from "next/navigation";
import { getPost } from "../actions";
import PostEditor from "@/components/builder/PostEditor";

export default async function EditPost({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return <PostEditor post={post} />;
}

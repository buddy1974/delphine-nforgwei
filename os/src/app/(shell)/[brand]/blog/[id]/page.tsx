import { notFound } from "next/navigation";
import { getPost } from "@/app/(shell)/blog/actions";
import PostEditor from "@/components/builder/PostEditor";

export default async function BrandPostEditorPage({
  params,
}: {
  params: { brand: string; id: string };
}) {
  const result = await getPost(params.id);
  if (!result) notFound();
  return <PostEditor post={result} />;
}

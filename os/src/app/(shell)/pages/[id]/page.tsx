import { notFound } from "next/navigation";
import { getPage } from "../actions";
import PageEditor from "@/components/builder/PageEditor";

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getPage(params.id);
  if (!result) notFound();
  return <PageEditor page={result.page} initialSections={result.sections} />;
}

import { notFound } from "next/navigation";
import { getPage } from "@/app/(shell)/pages/actions";
import PageEditor from "@/components/builder/PageEditor";

export default async function BrandPageEditorPage({
  params,
}: {
  params: { brand: string; id: string };
}) {
  const result = await getPage(params.id);
  if (!result) notFound();
  return <PageEditor page={result.page} initialSections={result.sections} />;
}

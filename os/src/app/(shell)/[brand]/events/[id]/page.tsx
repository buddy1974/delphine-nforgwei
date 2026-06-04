import { notFound } from "next/navigation";
import { getEvent } from "@/app/(shell)/events/actions";
import EventEditor from "@/components/builder/EventEditor";

export default async function BrandEventEditorPage({
  params,
}: {
  params: { brand: string; id: string };
}) {
  const result = await getEvent(params.id);
  if (!result) notFound();
  return <EventEditor event={result} />;
}

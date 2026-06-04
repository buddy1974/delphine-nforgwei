import { notFound } from "next/navigation";
import { getEvent } from "../actions";
import EventEditor from "@/components/builder/EventEditor";

export default async function EditEvent({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  if (!event) notFound();
  return <EventEditor event={event} />;
}

import MessageCenter from "../MessageCenter";

export default function Page({ params }: { params: { id: string } }) {
  return <MessageCenter initialId={params.id} />;
}

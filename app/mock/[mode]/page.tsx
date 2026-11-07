import { notFound } from "next/navigation";
import { MockRoom } from "@/components/mock-room";
import { mockById, mocks } from "@/lib/mocks";

export function generateStaticParams() {
  return mocks.map((mock) => ({ mode: mock.id }));
}

export default async function MockModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  const def = mockById(mode);
  if (!def) notFound();
  return <MockRoom def={def} />;
}

import { notFound } from "next/navigation";
import { TopicView } from "@/components/topic-view";
import { allTopics, findTopic } from "@/lib/syllabus";

export function generateStaticParams() {
  return allTopics().map(({ topic }) => ({ id: topic.id }));
}

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const placed = findTopic(id);
  if (!placed) notFound();
  return <TopicView placed={placed} />;
}

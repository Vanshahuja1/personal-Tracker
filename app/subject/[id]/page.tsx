import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { findSubject, subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects.map((subject) => ({ id: subject.id }));
}

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findSubject(id)) notFound();
  return <Catalog subjectId={id} />;
}

import { notFound } from "next/navigation";
import { BuildProblem } from "@/components/build-view";
import { findProblem, problemList } from "@/lib/syllabus";

export function generateStaticParams() {
  return problemList().map((problem) => ({ id: problem.id }));
}

export default async function BuildItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = findProblem(id);
  if (!problem) notFound();
  return <BuildProblem problem={problem} />;
}

"use client";

import { Catalog } from "@/components/catalog";

export default function SyllabusPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Syllabus</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Filter by track, priority, or what still feels weak. Open any topic.</p>
      </div>
      <Catalog />
    </div>
  );
}

"use client";

import Link from "next/link";
import type { MachineProblem } from "@/lib/types";
import { problemList } from "@/lib/syllabus";
import { useStore } from "@/lib/store";

export function BuildList() {
  const groups = [
    ["python", "Python"],
    ["backend", "Backend"],
    ["ai", "AI applications"],
  ] as const;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Machine coding</h1>
        <p className="mt-0.5 text-sm text-slate-500">The solution is not on the page. Attempt it, then open a direction if you are stuck.</p>
      </div>
      <div className="flex flex-col gap-7">
        {groups.map(([domain, label]) => (
          <section key={domain}>
            <h2 className="mb-2.5 px-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</h2>
            <div className="flex flex-col gap-2.5">
              {problemList().filter((problem) => problem.domain === domain).map((problem) => (
                <Link key={problem.id} href={`/build/${problem.id}`} className="block rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900">
                  <strong className="text-sm text-slate-800 dark:text-slate-100">{problem.name}</strong>
                  <span className="mt-0.5 block text-xs text-slate-400">{problem.priority} · {problem.aiAssistance === "allowed" ? "Assistant allowed" : "No assistant"}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function BuildProblem({ problem }: { problem: MachineProblem }) {
  const store = useStore();
  const log = store.data.problems[problem.id] ?? { attempted: false, notes: "", showDirection: false };
  const blocks: [string, string[]][] = [
    ["Functional requirements", problem.functional],
    ["Non-functional requirements", problem.nonFunctional],
    ["API", problem.api],
    ["Data model", problem.dataModel],
    ["Architecture", problem.architecture],
    ["Build order", problem.steps],
    ["Edge cases", problem.edgeCases],
    ["Tests", problem.tests],
    ["Rubric", problem.rubric],
  ];
  return (
    <article className="reading stack">
      <p className="stamp">{problem.aiAssistance === "allowed" ? "Assistant allowed" : "Do this without an assistant"}</p>
      <h1>{problem.name}</h1>
      <p>{problem.statement}</p>
      {blocks.map(([title, items]) => (
        <section key={title}>
          <h2 style={{ fontSize: 26 }}>{title}</h2>
          <ul className="list-reset">{items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
      <label>Notes from the attempt
        <textarea value={log.notes} onChange={(event) => store.patchProblem(problem.id, { notes: event.target.value, attempted: true })} />
      </label>
      <button className="text-btn" type="button" onClick={() => store.patchProblem(problem.id, { attempted: true })}>I attempted this</button>
      {log.attempted && !log.showDirection && (
        <button className="primary-btn" type="button" onClick={() => store.patchProblem(problem.id, { showDirection: true })}>Show a direction, not the solution</button>
      )}
      {log.showDirection && (
        <div className="answer">
          <ul className="list-reset">{problem.direction.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </article>
  );
}

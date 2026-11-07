"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { allTopics, findSubject, isWeak, matchesPriority, matchesTrack } from "@/lib/syllabus";
import type { Priority, Status } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type TrackFilter = "all" | "ai" | "swe" | "common";
type StatusFilter = "all" | "weak" | "ready" | "open" | Status;

const card = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900";

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="mr-0.5 text-[11px] font-medium text-slate-400">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${value === option.value ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Catalog({ subjectId }: { subjectId?: string }) {
  const store = useStore();
  const [track, setTrack] = useState<TrackFilter>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const subject = subjectId ? findSubject(subjectId) : null;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allTopics().filter(({ topic, subject: owner, module }) => {
      if (subjectId && owner.id !== subjectId) return false;
      if (!matchesTrack(topic.tracks, track)) return false;
      if (!matchesPriority(topic.priority, priority)) return false;
      const log = store.logFor(topic.id);
      if (status === "weak" && !isWeak(log.status, log.confidence)) return false;
      if (status === "ready" && log.status !== "interview-ready") return false;
      if (status === "open" && (log.status === "interview-ready" || log.status === "not-started")) return false;
      if (status !== "all" && status !== "weak" && status !== "ready" && status !== "open" && log.status !== status) return false;
      if (!needle) return true;
      return `${topic.name} ${owner.name} ${module.name}`.toLowerCase().includes(needle);
    });
  }, [priority, query, status, store, subjectId, track]);

  const groups = new Map<string, { module: string; topics: typeof rows }>();
  for (const row of rows) {
    const key = `${row.subject.id}:${row.module.id}`;
    const current = groups.get(key) ?? { module: subjectId ? row.module.name : `${row.subject.name} · ${row.module.name}`, topics: [] };
    current.topics.push(row);
    groups.set(key, current);
  }

  return (
    <div>
      {subject && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subject.summary}</p>
        </div>
      )}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search topics"
          aria-label="Search topics"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Chips label="Track" value={track} onChange={setTrack} options={[{ value: "all", label: "All" }, { value: "ai", label: "AI" }, { value: "swe", label: "SWE" }, { value: "common", label: "Common" }]} />
        <Chips label="Priority" value={priority} onChange={setPriority} options={[{ value: "all", label: "All" }, { value: "P0", label: "P0" }, { value: "P1", label: "P1" }, { value: "P2", label: "P2" }, { value: "P3", label: "P3" }]} />
        <Chips label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All" }, { value: "open", label: "In progress" }, { value: "ready", label: "Ready" }, { value: "weak", label: "Weak" }, { value: "not-started", label: "Not started" }]} />
      </div>
      <div className="flex flex-col gap-7">
        {[...groups.entries()].map(([key, group]) => (
          <section key={key}>
            <div className="mb-2.5 flex items-center justify-between px-1">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">{group.module}</h2>
              <span className="text-[11px] font-medium tabular-nums text-slate-400">{group.topics.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {group.topics.map(({ topic }) => {
                const log = store.logFor(topic.id);
                const tone = topic.priority === "P0" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15" : topic.priority === "P1" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300";
                const done = log.status === "interview-ready";
                return (
                  <div key={topic.id} className={`${card} flex items-center gap-3 p-3.5 sm:px-4 ${done ? "border-emerald-200 dark:border-emerald-500/30" : ""}`}>
                    <input
                      type="checkbox"
                      className="size-5 shrink-0 accent-sky-500"
                      checked={done}
                      aria-label={`Done: ${topic.name}`}
                      onChange={(event) => store.setDone(topic.id, event.target.checked)}
                    />
                    <Link href={`/topic/${topic.id}`} className="flex min-w-0 flex-1 items-center gap-3 no-underline">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={`text-sm font-semibold ${done ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`}>{topic.name}</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>{topic.priority}</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{done ? "Done" : statusLabel(log.status)}</p>
                      </div>
                      <ChevronRight className="shrink-0 text-slate-300" size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {rows.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-white/10">No topics match the current search and filters.</div>}
      </div>
    </div>
  );
}

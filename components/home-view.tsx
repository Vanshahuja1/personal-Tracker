"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, Check, ChevronRight, PlayCircle, Quote, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { findTopic, isWeak, subjects, topicCount } from "@/lib/syllabus";
import { statusLabel } from "@/lib/types";

const card = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900 dark:shadow-none";

function greetingFor(hour: number | null) {
  if (hour === null) return { text: "Hello", emoji: "👋" };
  if (hour < 5) return { text: "Hello night owl", emoji: "🦉" };
  if (hour < 12) return { text: "Happy morning", emoji: "☀️" };
  if (hour < 17) return { text: "Shine on this afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌇" };
  return { text: "Hello night owl", emoji: "🦉" };
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <div className={`h-full rounded-full ${value === 100 ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function HomeView() {
  const store = useStore();
  const [hour, setHour] = useState<number | null>(null);
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    setHour(now.getHours());
    setTodayLabel(now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const topics = subjects.flatMap((subject) => subject.modules.flatMap((module) => module.topics));
  const total = topics.length;
  const ready = topics.filter((topic) => store.logFor(topic.id).status === "interview-ready").length;
  const started = topics.filter((topic) => store.logFor(topic.id).status !== "not-started").length;
  const weak = topics.filter((topic) => {
    const log = store.logFor(topic.id);
    return isWeak(log.status, log.confidence);
  });
  const inProgress = topics.filter((topic) => {
    const status = store.logFor(topic.id).status;
    return status !== "not-started" && status !== "interview-ready";
  }).slice(0, 4);
  const recentMocks = store.data.mocks.filter((session) => session.finishedAt).slice(0, 3);
  const pin = store.data.pin ? findTopic(store.data.pin) : null;
  const greeting = greetingFor(hour);
  const percent = total ? Math.round((ready / total) * 100) : 0;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "preppilot-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{greeting.text}, Vansh <span aria-hidden="true">{greeting.emoji}</span></h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{todayLabel ? `${todayLabel} · one topic at a time, no countdown` : "Pick one topic and finish it."}</p>
      </div>

      <section className={`${card} mb-5 p-5 sm:p-6`}>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Your introduction</div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          I&apos;m Vansh Ahuja, an AI engineer and full-stack developer. B.Tech in Computer Science, Graphic Era Hill University, 2025. Intern at Digital2Days, then a year remote at One Aim on the employee-portal schema and APIs. Since February 2026, AI engineer at Monkstack: a blueprint-to-3D pipeline that cut model calls by 70 percent, a multi-tenant FastAPI service, and a shopping assistant over 5,000 variants. I want a role that owns retrieval, tools, and the service around them.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
          <Link href="/topic/me-intro" className="text-sky-600 hover:text-sky-700">Open the introduction</Link>
          <Link href="/subject/career" className="text-sky-600 hover:text-sky-700">Roles and projects</Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 p-5 sm:p-6 dark:border-sky-500/20 dark:from-sky-950/40 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600"><Sparkles size={13} /> Sitting with</div>
            {pin ? (
              <p className="mt-3 flex gap-2 text-[17px] font-medium leading-relaxed text-slate-800 sm:text-lg dark:text-slate-100">
                <Quote size={18} className="mt-1 shrink-0 text-sky-300" />
                {pin.topic.name}
              </p>
            ) : (
              <p className="mt-3 text-[17px] font-medium leading-relaxed text-slate-800 dark:text-slate-100">No topic pinned. Open any subject and sit with one.</p>
            )}
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{pin ? `${pin.subject.name} / ${pin.module.name}` : "You do not have to finish one subject before another."}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-white bg-white/80 p-4 md:w-64 dark:border-white/10 dark:bg-slate-950/60">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</div>
            <div className="mt-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">{pin ? `${statusLabel(store.logFor(pin.topic.id).status)} · ${pin.topic.priority}` : "Nothing pinned"}</div>
            <Link href={pin ? `/topic/${pin.topic.id}` : "/syllabus"} className="mt-3 flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
              {pin ? "Open topic" : "Browse syllabus"} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={BarChart3} tone="sky" label="Interview ready" value={`${percent}%`} detail={`${ready} of ${total} topics`} bar={percent} />
        <Stat icon={Check} tone="emerald" label="Topics opened" value={String(started)} detail={`${total - started} still not started`} bar={total ? Math.round((started / total) * 100) : 0} />
        <Stat icon={AlertTriangle} tone="orange" label="Weak topics" value={String(weak.length)} detail="Revision or confidence 1–2" />
        <Stat icon={Sparkles} tone="violet" label="Mocks finished" value={String(store.data.mocks.filter((session) => session.finishedAt).length)} detail="Five modes, scored by you" />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className={`${card} p-5 sm:p-6`}>
          <SectionTitle title="Continue preparing" subtitle={inProgress.length ? "Topics you already started" : "Nothing in progress yet"} />
          {inProgress.length === 0 ? <Empty text="Open a topic and set its status to In progress. It will show up here." /> : (
            <div className="flex flex-col gap-2">
              {inProgress.map((topic) => {
                const placed = findTopic(topic.id);
                const log = store.logFor(topic.id);
                const checks = Object.values(log.checklist).filter(Boolean).length;
                return (
                  <Link key={topic.id} href={`/topic/${topic.id}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left no-underline transition hover:border-sky-200 hover:bg-sky-50/40 dark:border-white/10 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15"><PlayCircle size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">{topic.name}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1"><ProgressBar value={Math.round((checks / 6) * 100)} /></div>
                        <span className="text-[11px] font-semibold tabular-nums text-slate-400">{statusLabel(log.status)}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-sky-500" size={16} />
                    <span className="sr-only">{placed?.subject.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        <section className={`${card} p-5 sm:p-6`}>
          <SectionTitle title="Subject progress" subtitle="Share of topics marked interview ready" />
          <div className="flex flex-col gap-3.5">
            {subjects.map((subject) => {
              const count = topicCount(subject.modules);
              const done = subject.modules.flatMap((module) => module.topics).filter((topic) => store.logFor(topic.id).status === "interview-ready").length;
              const value = count ? Math.round((done / count) * 100) : 0;
              return (
                <Link key={subject.id} href={`/subject/${subject.id}`} className="group flex items-center gap-3 text-left no-underline">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">{subject.name}</span>
                      <span className="text-[11px] font-semibold tabular-nums text-slate-500">{done}/{count}</span>
                    </div>
                    <div className="mt-1.5"><ProgressBar value={value} /></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className={`${card} p-5 sm:p-6`}>
          <SectionTitle title="Weak topics" subtitle="Needs revision, or confidence 1 or 2" />
          {weak.length === 0 ? <Empty text="Mark a topic for revision, or set confidence to 1 or 2, and it will land here." /> : (
            <div className="flex flex-col gap-2">
              {weak.slice(0, 6).map((topic) => (
                <Link key={topic.id} href={`/topic/${topic.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 no-underline dark:border-white/10">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15"><AlertTriangle size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">{topic.name}</div>
                    <div className="text-[11px] text-slate-400">{statusLabel(store.logFor(topic.id).status)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className={`${card} p-5 sm:p-6`}>
          <SectionTitle title="Recent mocks" subtitle="Finished rounds stay here" action={<Link href="/mock" className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">Open modes <ArrowRight size={14} /></Link>} />
          {recentMocks.length === 0 ? <Empty text="A finished mock shows its date here. Scores stay the ones you enter." /> : (
            <ul className="m-0 list-none p-0">
              {recentMocks.map((session) => (
                <li key={session.id} className="border-t border-slate-100 py-2 text-[13px] text-slate-600 first:border-0 dark:border-white/10 dark:text-slate-300">{session.mode} · {session.finishedAt?.slice(0, 10)}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section id="backup" className={`${card} mt-5 p-5 sm:p-6`}>
        <SectionTitle title="Backup & restore" subtitle="Progress stays in this browser. Download a file before you switch machines." />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className="rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-600">Download backup</button>
          <label className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
            Restore from file
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  store.replaceAll(JSON.parse(await file.text()));
                } catch {
                  /* ignore unreadable backups */
                }
              }}
            />
          </label>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-white/10">{text}</div>;
}

function Stat({ icon: Icon, label, value, detail, tone, bar }: { icon: typeof BarChart3; label: string; value: string; detail: string; tone: "sky" | "emerald" | "orange" | "violet"; bar?: number }) {
  const tones = {
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15",
    orange: "bg-orange-50 text-orange-500 dark:bg-orange-500/15",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15",
  };
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex size-8 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={16} /></div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-slate-400">{detail}</div>
      {bar !== undefined && <div className="mt-3"><ProgressBar value={bar} /></div>}
    </div>
  );
}

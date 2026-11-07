"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Binary, BookOpen, Bot, Brain, BriefcaseBusiness, Calculator, Cloud, Database, Hammer,
  LayoutDashboard, Menu, MessagesSquare, Moon, Network, PanelsTopLeft, Search, Server,
  Settings2, Sparkles, Sun, Target, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { subjects, topicCount } from "@/lib/syllabus";
import { useStore } from "@/lib/store";

const PROFILE = { name: "Vansh Ahuja", initials: "VA", role: "AI engineer · then software engineer" };

const subjectIcon: Record<string, LucideIcon> = {
  python: Binary,
  dsa: Network,
  math: Calculator,
  ml: Sparkles,
  dl: Brain,
  llm: MessagesSquare,
  rag: Search,
  agents: Bot,
  backend: Server,
  databases: Database,
  cs: BookOpen,
  design: PanelsTopLeft,
  cloud: Cloud,
  tools: Hammer,
  career: BriefcaseBusiness,
};

const subjectShort: Record<string, string> = {
  python: "Python",
  dsa: "DSA",
  math: "Math",
  ml: "Machine learning",
  dl: "Deep learning",
  llm: "LLMs",
  rag: "RAG",
  agents: "Agents",
  backend: "Backend",
  databases: "Databases",
  cs: "Core CS",
  design: "System design",
  cloud: "Cloud & MLOps",
  tools: "AI tools",
  career: "Career",
};

function rememberTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem("desk-theme", next);
  document.cookie = `desk-theme=${next};path=/;max-age=31536000;samesite=lax`;
}

function NavButton({ href, icon: Icon, label, badge, active, onNavigate }: {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium no-underline transition-colors ${active ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"}`}
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      <span className="truncate">{label}</span>
      {badge && (
        <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${active ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Shell({ children, theme: initial }: { children: React.ReactNode; theme: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(initial);
  const pathname = usePathname();
  const store = useStore();

  useEffect(() => {
    const saved = localStorage.getItem("desk-theme");
    if (saved !== "light" && saved !== "dark") return;
    if (saved === initial) return;
    setTheme(saved);
    rememberTheme(saved);
  }, [initial]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    rememberTheme(next);
  };

  const title = pathname.startsWith("/mock") ? "Mocks"
    : pathname.startsWith("/build") ? "Machine coding"
    : pathname.startsWith("/syllabus") ? "Syllabus"
    : pathname.startsWith("/topic/") ? "Topic"
    : pathname.startsWith("/subject/") ? (subjects.find((subject) => pathname === `/subject/${subject.id}`)?.name ?? "Subject")
    : "Overview";

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 dark:bg-[#0b1220] dark:text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-slate-200/80 bg-white transition-transform dark:border-white/10 dark:bg-slate-950 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-white"><Target size={18} /></div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">PrepPilot</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">AI interview prep</div>
          </div>
          <button className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 lg:hidden dark:hover:bg-white/5" onClick={() => setOpen(false)} aria-label="Close navigation" type="button"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <NavButton href="/" icon={LayoutDashboard} label="Overview" active={pathname === "/"} onNavigate={() => setOpen(false)} />
          <NavButton href="/syllabus" icon={BookOpen} label="Syllabus" active={isActive("/syllabus")} onNavigate={() => setOpen(false)} />
          <NavButton href="/mock" icon={MessagesSquare} label="Mocks" active={isActive("/mock")} onNavigate={() => setOpen(false)} />
          <NavButton href="/build" icon={Hammer} label="Machine coding" active={isActive("/build")} onNavigate={() => setOpen(false)} />
          <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Syllabus</p>
          {subjects.map((subject) => {
            const total = topicCount(subject.modules);
            const ready = subject.modules.flatMap((module) => module.topics).filter((topic) => store.logFor(topic.id).status === "interview-ready").length;
            const percent = total ? Math.round((ready / total) * 100) : 0;
            const Icon = subjectIcon[subject.id] ?? BookOpen;
            return (
              <NavButton
                key={subject.id}
                href={`/subject/${subject.id}`}
                icon={Icon}
                label={subjectShort[subject.id] ?? subject.name}
                badge={store.ready ? `${percent}%` : undefined}
                active={pathname === `/subject/${subject.id}`}
                onNavigate={() => setOpen(false)}
              />
            );
          })}
          <p className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Personal</p>
          <NavButton href="/#backup" icon={Settings2} label="Backup" active={false} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-slate-100 p-3 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-xl p-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-xs font-bold text-white">{PROFILE.initials}</div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{PROFILE.name}</div>
              <div className="truncate text-[11px] text-slate-400">{PROFILE.role}</div>
            </div>
          </div>
        </div>
      </aside>
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={() => setOpen(false)} type="button" />}

      <main className="lg:pl-[256px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-[#f6f8fb]/85 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1220]/85 sm:px-8">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-white lg:hidden dark:hover:bg-white/5" onClick={() => setOpen(true)} aria-label="Open navigation" type="button"><Menu size={20} /></button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
          </div>
          <button type="button" onClick={toggleTheme} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </header>
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

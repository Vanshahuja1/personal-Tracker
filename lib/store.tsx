"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { RubricKey } from "@/lib/mocks";
import type { Status } from "@/lib/types";

const STORAGE_KEY = "vansh-interview-desk-v1";

export type TopicLog = {
  status: Status;
  confidence: number | null;
  learned: string;
  important: string;
  stuck: string;
  implementation: string;
  mistakes: string;
  revision: string;
  checklist: Record<string, boolean>;
  revealed: string[];
  history: { at: string; status: Status }[];
};

export type MockAnswer = { questionId: string; answer: string; followUp: string; hintUsed: boolean };

export type MockSession = {
  id: string;
  mode: string;
  startedAt: string;
  finishedAt?: string;
  index: number;
  phase: "ask" | "follow" | "debrief";
  answers: MockAnswer[];
  draft: string;
  scores: Partial<Record<RubricKey, number>>;
  notes: string;
};

export type ProblemLog = { attempted: boolean; notes: string; showDirection: boolean };

type Data = {
  topics: Record<string, TopicLog>;
  pin: string | null;
  mocks: MockSession[];
  problems: Record<string, ProblemLog>;
};

const emptyLog = (): TopicLog => ({
  status: "not-started",
  confidence: null,
  learned: "",
  important: "",
  stuck: "",
  implementation: "",
  mistakes: "",
  revision: "",
  checklist: {},
  revealed: [],
  history: [],
});

const emptyData = (): Data => ({ topics: {}, pin: null, mocks: [], problems: {} });

function sanitize(raw: unknown): Data {
  if (!raw || typeof raw !== "object") return emptyData();
  const value = raw as Partial<Data>;
  return {
    topics: value.topics && typeof value.topics === "object" ? value.topics : {},
    pin: typeof value.pin === "string" ? value.pin : null,
    mocks: Array.isArray(value.mocks) ? value.mocks : [],
    problems: value.problems && typeof value.problems === "object" ? value.problems : {},
  };
}

type Store = {
  ready: boolean;
  data: Data;
  logFor: (id: string) => TopicLog;
  setStatus: (id: string, status: Status) => void;
  setDone: (id: string, done: boolean) => void;
  patchLog: (id: string, patch: Partial<TopicLog>) => void;
  toggleCheck: (id: string, item: string) => void;
  reveal: (id: string, questionId: string) => void;
  setPin: (id: string | null) => void;
  saveMock: (session: MockSession) => void;
  patchProblem: (id: string, patch: Partial<ProblemLog>) => void;
  replaceAll: (next: Data) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(emptyData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(sanitize(JSON.parse(saved)));
    } catch {
      /* keep empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked */
    }
  }, [data, ready]);

  const api = useMemo<Store>(() => {
    const updateTopic = (id: string, recipe: (current: TopicLog) => TopicLog) => {
      setData((current) => {
        const prev = current.topics[id] ?? emptyLog();
        return { ...current, topics: { ...current.topics, [id]: recipe(prev) } };
      });
    };
    return {
      ready,
      data,
      logFor: (id) => data.topics[id] ?? emptyLog(),
      setStatus: (id, status) =>
        updateTopic(id, (prev) => ({
          ...prev,
          status,
          history: [...prev.history, { at: new Date().toISOString(), status }],
        })),
      setDone: (id, done) =>
        updateTopic(id, (prev) => {
          const status: Status = done ? "interview-ready" : "not-started";
          return { ...prev, status, history: [...prev.history, { at: new Date().toISOString(), status }] };
        }),
      patchLog: (id, patch) => updateTopic(id, (prev) => ({ ...prev, ...patch })),
      toggleCheck: (id, item) =>
        updateTopic(id, (prev) => ({
          ...prev,
          checklist: { ...prev.checklist, [item]: !prev.checklist[item] },
        })),
      reveal: (id, questionId) =>
        updateTopic(id, (prev) =>
          prev.revealed.includes(questionId) ? prev : { ...prev, revealed: [...prev.revealed, questionId] },
        ),
      setPin: (id) => setData((current) => ({ ...current, pin: id })),
      saveMock: (session) =>
        setData((current) => {
          const mocks = current.mocks.some((item) => item.id === session.id)
            ? current.mocks.map((item) => (item.id === session.id ? session : item))
            : [session, ...current.mocks];
          return { ...current, mocks };
        }),
      patchProblem: (id, patch) =>
        setData((current) => {
          const prev = current.problems[id] ?? { attempted: false, notes: "", showDirection: false };
          return { ...current, problems: { ...current.problems, [id]: { ...prev, ...patch } } };
        }),
      replaceAll: (next) => setData(sanitize(next)),
    };
  }, [data, ready]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store missing");
  return store;
}

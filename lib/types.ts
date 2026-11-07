export type Priority = "P0" | "P1" | "P2" | "P3";
export type Track = "ai" | "swe" | "common";
export type Status =
  | "not-started"
  | "in-progress"
  | "learning-completed"
  | "practice-completed"
  | "interview-ready"
  | "needs-revision";

export type QA = { id: string; q: string; a: string; kind?: "conceptual" | "practical" | "advanced" };
export type CheckItem = { id: string; label: string };
export type Term = { t: string; d: string };
export type Drill = { name: string; difficulty: "easy" | "medium" | "hard"; prompt: string };
export type CrossRef = { id: string; note: string };

export type Topic = {
  id: string;
  name: string;
  priority: Priority;
  tracks: Track[];
  objectives: string[];
  beginner: string;
  technical: string;
  internals: string;
  flow: string;
  useCases: string[];
  terms: Term[];
  performance: string[];
  limits: string[];
  alternatives: string[];
  tradeoffs: string[];
  practice: string[];
  snippet?: { caption: string; code: string };
  questions: {
    fundamental: QA[];
    intermediate: QA[];
    scenario: QA[];
    followUp: QA[];
  };
  mistakes: string[];
  validation: QA[];
  drills?: Drill[];
  recognize?: string[];
  approach?: string[];
  refs?: CrossRef[];
};

export type Module = { id: string; name: string; topics: Topic[] };

export type Subject = {
  id: string;
  name: string;
  summary: string;
  modules: Module[];
};

export type MachineProblem = {
  id: string;
  name: string;
  domain: "python" | "backend" | "ai";
  priority: Priority;
  tracks: Track[];
  statement: string;
  functional: string[];
  nonFunctional: string[];
  api: string[];
  dataModel: string[];
  architecture: string[];
  steps: string[];
  edgeCases: string[];
  tests: string[];
  rubric: string[];
  aiAssistance: "forbidden" | "allowed";
  direction: string[];
};

export const STATUSES: { id: Status; label: string }[] = [
  { id: "not-started", label: "Not started" },
  { id: "in-progress", label: "In progress" },
  { id: "learning-completed", label: "Learning completed" },
  { id: "practice-completed", label: "Practice completed" },
  { id: "interview-ready", label: "Interview ready" },
  { id: "needs-revision", label: "Needs revision" },
];

export const completionChecklist: CheckItem[] = [
  { id: "concepts", label: "I can explain the concepts aloud without notes" },
  { id: "subtopics", label: "I covered the subtopics on this page" },
  { id: "interview", label: "I answered the interview questions before opening them" },
  { id: "practice", label: "I did the practical exercise where this topic has one" },
  { id: "validation", label: "I attempted the knowledge check before reading answers" },
  { id: "notes", label: "I wrote a learning log for this topic" },
];

export function statusLabel(status: Status) {
  return STATUSES.find((s) => s.id === status)?.label ?? status;
}

import type { MachineProblem } from "@/lib/types";
import type { Module, Priority, Status, Subject, Topic, Track } from "@/lib/types";
import { agentModules } from "@/lib/syllabus/agents";
import { backendModules } from "@/lib/syllabus/backend";
import { careerModules, toolModules } from "@/lib/syllabus/career";
import { databaseModules } from "@/lib/syllabus/databases";
import { dlModules } from "@/lib/syllabus/dl";
import { dsaModules } from "@/lib/syllabus/dsa";
import { llmModules } from "@/lib/syllabus/llm";
import { mlModules } from "@/lib/syllabus/ml";
import { pythonModules } from "@/lib/syllabus/python";
import { ragModules } from "@/lib/syllabus/rag";
import { cloudModules, csModules, designModules } from "@/lib/syllabus/systems";
import { problems } from "@/lib/problems";

export const subjects: Subject[] = [
  { id: "python", name: "Python for AI engineering", summary: "The language you will be asked to explain, not only to use.", modules: pythonModules },
  { id: "dsa", name: "DSA and coding interviews", summary: "Patterns, recognition, and a short problem list for each.", modules: dsaModules },
  { id: "ml", name: "Machine learning, kept short", summary: "Only the split, the metric, and the leak. You are not studying to be a model researcher.", modules: mlModules },
  { id: "dl", name: "Deep learning, kept short", summary: "One pass over a network and a training loop. The architecture to draw is in LLMs.", modules: dlModules },
  { id: "llm", name: "LLMs and generative AI", summary: "Transformers, decoding, adaptation, and how you evaluate a model.", modules: llmModules },
  { id: "rag", name: "RAG and AI applications", summary: "The system behind a grounded answer. Hybrid search lives here.", modules: ragModules },
  { id: "agents", name: "AI agents", summary: "Tools, state, permissions, and a loop you can bound.", modules: agentModules },
  { id: "backend", name: "Backend engineering", summary: "APIs, auth, queues, and a Python service that does not block itself.", modules: backendModules },
  { id: "databases", name: "Databases", summary: "SQL, indexes, transactions, and the copies people forget to invalidate.", modules: databaseModules },
  { id: "cs", name: "Core computer science", summary: "Processes, memory, the network path, and design principles.", modules: csModules },
  { id: "design", name: "System design", summary: "Requirements, distributed tradeoffs, and AI systems as search plus a model.", modules: designModules },
  { id: "cloud", name: "Cloud, delivery, and MLOps", summary: "Ship a service, version a model, and watch the few signals that matter.", modules: cloudModules },
  { id: "tools", name: "AI-assisted development", summary: "How to use coding agents and still own the change.", modules: toolModules },
  { id: "career", name: "You, your work, and the offer", summary: "Your introduction, how you explain each role, and the projects they will ask you to draw.", modules: careerModules },
];

export type PlacedTopic = {
  topic: Topic;
  subject: Subject;
  module: Module;
};

const placed: PlacedTopic[] = subjects.flatMap((subject) =>
  subject.modules.flatMap((module) => module.topics.map((topic) => ({ topic, subject, module }))),
);

const byId = new Map(placed.map((item) => [item.topic.id, item]));

export function allTopics() {
  return placed;
}

export function findTopic(id: string) {
  return byId.get(id) ?? null;
}

export function findSubject(id: string) {
  return subjects.find((subject) => subject.id === id) ?? null;
}

export function findProblem(id: string) {
  return problems.find((problem) => problem.id === id) ?? null;
}

export function topicCount(modules: Module[]) {
  return modules.reduce((sum, module) => sum + module.topics.length, 0);
}

export function matchesTrack(tracks: readonly Track[], track: "all" | "ai" | "swe" | "common") {
  if (track === "all") return true;
  if (track === "common") return tracks.includes("common");
  return tracks.includes(track) || tracks.includes("common");
}

export function matchesPriority(priority: Priority, filter: "all" | Priority) {
  return filter === "all" || priority === filter;
}

export function isWeak(status: Status, confidence: number | null) {
  return status === "needs-revision" || (confidence !== null && confidence <= 2);
}

export function problemList(): MachineProblem[] {
  return problems;
}

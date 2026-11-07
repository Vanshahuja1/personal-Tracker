import type { CrossRef, Drill, Priority, QA, Topic, Track } from "@/lib/types";

type Pair = [q: string, a: string];

export type TopicDraft = {
  id: string;
  name: string;
  priority: Priority;
  tracks: readonly Track[];
  objectives: string[];
  beginner: string;
  technical: string;
  internals: string;
  flow: string;
  useCases: string[];
  terms: [string, string][];
  performance?: string[];
  limits?: string[];
  alternatives?: string[];
  tradeoffs?: string[];
  practice?: string[];
  snippet?: { caption: string; code: string };
  fundamental: Pair[];
  intermediate?: Pair[];
  scenario?: Pair[];
  followUp?: Pair[];
  mistakes: string[];
  conceptual: Pair[];
  practical?: Pair[];
  advanced?: Pair[];
  drills?: Drill[];
  recognize?: string[];
  approach?: string[];
  refs?: CrossRef[];
};

function bank(id: string, prefix: string, pairs: Pair[] | undefined, kind?: QA["kind"]): QA[] {
  return (pairs ?? []).map(([q, a], index) => ({
    id: `${id}-${prefix}${index + 1}`,
    q,
    a,
    kind,
  }));
}

export function topic(draft: TopicDraft): Topic {
  return {
    id: draft.id,
    name: draft.name,
    priority: draft.priority,
    tracks: [...draft.tracks],
    objectives: draft.objectives,
    beginner: draft.beginner,
    technical: draft.technical,
    internals: draft.internals,
    flow: draft.flow,
    useCases: draft.useCases,
    terms: draft.terms.map(([t, d]) => ({ t, d })),
    performance: draft.performance ?? [],
    limits: draft.limits ?? [],
    alternatives: draft.alternatives ?? [],
    tradeoffs: draft.tradeoffs ?? [],
    practice: draft.practice ?? [],
    snippet: draft.snippet,
    questions: {
      fundamental: bank(draft.id, "f", draft.fundamental),
      intermediate: bank(draft.id, "i", draft.intermediate),
      scenario: bank(draft.id, "s", draft.scenario),
      followUp: bank(draft.id, "u", draft.followUp),
    },
    mistakes: draft.mistakes,
    validation: [
      ...bank(draft.id, "vc", draft.conceptual, "conceptual"),
      ...bank(draft.id, "vp", draft.practical, "practical"),
      ...bank(draft.id, "va", draft.advanced, "advanced"),
    ],
    drills: draft.drills,
    recognize: draft.recognize,
    approach: draft.approach,
    refs: draft.refs,
  };
}

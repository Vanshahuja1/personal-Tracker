"use client";

import { useEffect, useState } from "react";
import { mockById, rubricLabels, type MockDef } from "@/lib/mocks";
import { findTopic } from "@/lib/syllabus";
import { useStore, type MockSession } from "@/lib/store";
import Link from "next/link";

function average(session: MockSession) {
  const values = rubricLabels.map((item) => session.scores[item.key]).filter((value): value is number => typeof value === "number");
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function readiness(score: number | null) {
  if (score === null) return "Score the round before you call it.";
  if (score < 5) return "Not ready for this loop. Revise the missed topics before another full mock.";
  if (score < 7) return "Shaky. You can hold a screen, and the gaps will show in a final round.";
  if (score < 8.5) return "Competitive for some rounds. The low categories are the work.";
  return "Strong on this sitting. Do not treat one score as an offer.";
}

export function MockRoom({ def }: { def: MockDef }) {
  const store = useStore();
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    if (!store.ready || session) return;
    const found = store.data.mocks.find((item) => item.mode === def.id && !item.finishedAt);
    if (found) setSession(found);
  }, [def.id, session, store.data.mocks, store.ready]);

  const persist = (next: MockSession) => {
    setSession(next);
    store.saveMock(next);
  };

  const start = () => {
    persist({
      id: `${def.id}-${Date.now()}`,
      mode: def.id,
      startedAt: new Date().toISOString(),
      index: 0,
      phase: "ask",
      answers: [],
      draft: "",
      scores: {},
      notes: "",
    });
  };

  if (!session) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">{def.name}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{def.blurb}</p>
        <p className="mt-1 text-sm text-slate-500">{def.assistance} One question at a time. Answers stay hidden until the debrief.</p>
        <button className="primary-btn mt-4" type="button" onClick={start}>Start this mock</button>
      </div>
    );
  }

  const question = def.questions[session.index];
  const finished = session.phase === "debrief";

  const submitAsk = () => {
    if (!question) return;
    persist({ ...session, phase: "follow", draft: "" , answers: [...session.answers, { questionId: question.id, answer: session.draft.trim(), followUp: "", hintUsed: false }] });
  };

  const submitFollow = () => {
    const answers = session.answers.map((item, index) => index === session.answers.length - 1 ? { ...item, followUp: session.draft.trim() } : item);
    const last = session.index === def.questions.length - 1;
    persist({
      ...session,
      answers,
      draft: "",
      index: last ? session.index : session.index + 1,
      phase: last ? "debrief" : "ask",
      finishedAt: last ? new Date().toISOString() : undefined,
    });
  };

  const useHint = () => {
    const answers = session.answers.map((item, index) => index === session.answers.length - 1 ? { ...item, hintUsed: true } : item);
    persist({ ...session, answers });
  };

  if (!finished && question) {
    const current = session.answers.at(-1);
    return (
      <div className="reading stack">
        <p className="muted">Question {session.index + 1} of {def.questions.length}</p>
        <h1>{session.phase === "ask" ? question.prompt : question.followUp}</h1>
        <textarea value={session.draft} onChange={(event) => setSession({ ...session, draft: event.target.value })} aria-label="Your answer" />
        {session.phase === "ask" ? (
          <button className="primary-btn" type="button" disabled={!session.draft.trim()} onClick={submitAsk}>Submit answer</button>
        ) : (
          <div className="row">
            <button className="primary-btn" type="button" disabled={!session.draft.trim()} onClick={submitFollow}>Submit follow-up</button>
            <button className="text-btn" type="button" onClick={useHint}>{current?.hintUsed ? "Hint shown below" : "Ask for a hint"}</button>
          </div>
        )}
        {session.phase === "follow" && current?.hintUsed && <p className="answer">{question.hint}</p>}
      </div>
    );
  }

  const score = average(session);
  return (
    <div className="reading stack">
      <h1>Debrief</h1>
      <p>{readiness(score)} {score !== null && <strong> Average {score}/10.</strong>}</p>
      <p className="muted">Mark a category down if you hesitated or hand-waved. This score is yours.</p>
      {rubricLabels.map((item) => (
        <label key={item.key}>
          {item.label}
          <input
            type="number"
            min={0}
            max={10}
            value={session.scores[item.key] ?? ""}
            onChange={(event) => persist({ ...session, scores: { ...session.scores, [item.key]: event.target.value === "" ? undefined : Number(event.target.value) } })}
          />
        </label>
      ))}
      <label>What felt weak
        <textarea value={session.notes} onChange={(event) => persist({ ...session, notes: event.target.value })} />
      </label>
      {session.answers.map((answer) => {
        const item = def.questions.find((question) => question.id === answer.questionId);
        if (!item) return null;
        return (
          <article key={answer.questionId} className="sheet" style={{ padding: 14 }}>
            <h2 style={{ fontSize: 22 }}>{item.prompt}</h2>
            <p><strong>Your answer. </strong>{answer.answer || "Blank."}</p>
            <p><strong>Follow-up. </strong>{item.followUp}</p>
            <p>{answer.followUp || "Blank."}</p>
            <div className="answer">
              <strong>Ideal structure. </strong>{item.ideal}
              <div className="row" style={{ marginTop: 8 }}>
                {item.topicIds.map((id) => {
                  const topic = findTopic(id);
                  return topic ? <Link key={id} href={`/topic/${id}`}>{topic.topic.name}</Link> : null;
                })}
              </div>
            </div>
          </article>
        );
      })}
      <button className="text-btn" type="button" onClick={() => setSession(null)}>Leave this debrief</button>
    </div>
  );
}

export function MockList() {
  const modes = ["ai", "swe", "design", "coding", "loop"] as const;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Five mocks</h1>
        <p className="mt-0.5 text-sm text-slate-500">Each mode is separate. Nothing here is timed.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {modes.map((id) => {
          const def = mockById(id);
          if (!def) return null;
          return (
            <Link key={id} href={`/mock/${id}`} className="block rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900">
              <strong className="text-sm text-slate-800 dark:text-slate-100">{def.name}</strong>
              <span className="mt-0.5 block text-xs text-slate-400">{def.blurb}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

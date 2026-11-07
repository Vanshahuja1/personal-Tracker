"use client";

import Link from "next/link";
import type { QA } from "@/lib/types";
import type { PlacedTopic } from "@/lib/syllabus";
import { findTopic } from "@/lib/syllabus";
import { useStore } from "@/lib/store";

function QuestionList({ items, topicId }: { items: QA[]; topicId: string }) {
  const store = useStore();
  const log = store.logFor(topicId);
  if (!items.length) return null;
  return (
    <div>
      {items.map((item) => {
        const open = log.revealed.includes(item.id);
        return (
          <article key={item.id} className="qa">
            <p style={{ margin: 0 }}>{item.q}</p>
            {open ? (
              <div className="answer">{item.a}</div>
            ) : (
              <button className="text-btn" type="button" style={{ marginTop: 8 }} onClick={() => store.reveal(topicId, item.id)}>
                Show the answer
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function TopicView({ placed }: { placed: PlacedTopic }) {
  const { topic, subject, module } = placed;
  const store = useStore();
  const log = store.logFor(topic.id);
  const pinned = store.data.pin === topic.id;
  const validationGroups = [
    ["Conceptual", topic.validation.filter((item) => item.kind === "conceptual")],
    ["Practical", topic.validation.filter((item) => item.kind === "practical")],
    ["Advanced", topic.validation.filter((item) => item.kind === "advanced")],
  ] as const;

  return (
    <article className="reading">
      <p className="text-xs text-slate-400" style={{ marginTop: 0 }}>
        <Link href={`/subject/${subject.id}`} className="text-sky-600 no-underline">{subject.name}</Link>
        {" / "}
        {module.name}
      </p>
      <div className="row">
        <span className="stamp">{topic.priority}</span>
        <span className="text-xs text-slate-400">{topic.tracks.join(", ")}</span>
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{topic.name}</h1>
      <div className="row">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <input
            type="checkbox"
            className="size-5 accent-sky-500"
            checked={log.status === "interview-ready"}
            onChange={(event) => store.setDone(topic.id, event.target.checked)}
          />
          Done with this topic
        </label>
        <button className="text-btn" type="button" onClick={() => store.setPin(pinned ? null : topic.id)}>
          {pinned ? "Leave this topic" : "Sit with this topic"}
        </button>
      </div>

      <section className="section">
        <div className="mark">A</div>
        <div>
          <h2>Learning objectives</h2>
          <ul className="list-reset">{topic.objectives.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section">
        <div className="mark">B</div>
        <div className="prose">
          <h2>Conceptual understanding</h2>
          <p>{topic.beginner}</p>
          <p>{topic.technical}</p>
          <p>{topic.internals}</p>
          <p>{topic.flow}</p>
          <ul className="list-reset">{topic.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section">
        <div className="mark">C</div>
        <div>
          <h2>Technical deep dive</h2>
          {topic.terms.map((term) => (
            <p key={term.t}><strong>{term.t}. </strong>{term.d}</p>
          ))}
          {topic.performance.map((item) => <p key={item}>{item}</p>)}
          {topic.limits.map((item) => <p key={item}>{item}</p>)}
          {topic.alternatives.map((item) => <p key={item}>{item}</p>)}
          {topic.tradeoffs.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>

      <section className="section">
        <div className="mark">D</div>
        <div>
          <h2>Practical implementation</h2>
          <ul className="list-reset">{topic.practice.map((item) => <li key={item}>{item}</li>)}</ul>
          {topic.snippet && (
            <>
              <p>{topic.snippet.caption}</p>
              <pre><code>{topic.snippet.code}</code></pre>
            </>
          )}
          {topic.recognize && topic.recognize.length > 0 && (
            <>
              <h3>When to recognize it</h3>
              <ul className="list-reset">{topic.recognize.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}
          {topic.approach && topic.approach.length > 0 && (
            <>
              <h3>How to approach it</h3>
              <ul className="list-reset">{topic.approach.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}
          {topic.drills && topic.drills.length > 0 && (
            <>
              <h3>Curated problems</h3>
              <ul className="list-reset">
                {topic.drills.map((drill) => (
                  <li key={drill.name}><strong>{drill.name}</strong> ({drill.difficulty}). {drill.prompt}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="mark">E</div>
        <div>
          <h2>Interview preparation</h2>
          <p className="muted">Answer aloud first. The written answer is a reference, not a script.</p>
          <h3>Fundamentals</h3>
          <QuestionList items={topic.questions.fundamental} topicId={topic.id} />
          <h3>Intermediate and advanced</h3>
          <QuestionList items={topic.questions.intermediate} topicId={topic.id} />
          <h3>Scenarios</h3>
          <QuestionList items={topic.questions.scenario} topicId={topic.id} />
          <h3>Follow-ups</h3>
          <QuestionList items={topic.questions.followUp} topicId={topic.id} />
        </div>
      </section>

      <section className="section">
        <div className="mark">F</div>
        <div>
          <h2>Common mistakes</h2>
          <ul className="list-reset">{topic.mistakes.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section">
        <div className="mark">G</div>
        <div>
          <h2>Knowledge check</h2>
          <p className="muted">Write an answer before you open it.</p>
          {validationGroups.map(([label, items]) => items.length > 0 && (
            <div key={label}>
              <h3>{label}</h3>
              <QuestionList items={items} topicId={topic.id} />
            </div>
          ))}
        </div>
      </section>

      {topic.refs && topic.refs.length > 0 && (
        <section className="section">
          <div className="mark">+</div>
          <div>
            <h2>Related topics</h2>
            <ul className="list-reset">
              {topic.refs.map((ref) => {
                const target = findTopic(ref.id);
                return (
                  <li key={ref.id}>
                    {target ? <Link href={`/topic/${ref.id}`}>{target.topic.name}</Link> : ref.id}
                    {". "}
                    {ref.note}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

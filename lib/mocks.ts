export type MockMode = "ai" | "swe" | "design" | "coding" | "loop";

export type RubricKey =
  | "technical"
  | "conceptual"
  | "depth"
  | "problemSolving"
  | "communication"
  | "practical"
  | "edgeCases";

export const rubricLabels: { key: RubricKey; label: string }[] = [
  { key: "technical", label: "Technical correctness" },
  { key: "conceptual", label: "Conceptual understanding" },
  { key: "depth", label: "Depth" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "communication", label: "Communication" },
  { key: "practical", label: "Practical engineering" },
  { key: "edgeCases", label: "Edge cases" },
];

export type MockQuestion = {
  id: string;
  prompt: string;
  followUp: string;
  hint: string;
  ideal: string;
  topicIds: string[];
};

export type MockDef = {
  id: MockMode;
  name: string;
  blurb: string;
  assistance: string;
  questions: MockQuestion[];
};

export const mocks: MockDef[] = [
  {
    id: "ai",
    name: "AI engineer technical",
    blurb: "Python, models, retrieval, and the systems around them.",
    assistance: "No external notes and no model. Talk.",
    questions: [
      {
        id: "ai-1",
        prompt: "A teammate says the chatbot hallucinates, so we should fine-tune it on the company wiki. What do you do instead, and when would you still fine-tune?",
        followUp: "The wiki changes every day. How does that change the decision?",
        hint: "Separate knowledge from behavior.",
        ideal: "Fine-tuning is for format and behavior. Changing facts belong in retrieval with reindexing. Fine-tune only if the style or the tool habit is still wrong after the retriever is measured. Daily changes make a fine-tune stale immediately.",
        topicIds: ["rag-fundamentals", "llm-train"],
      },
      {
        id: "ai-2",
        prompt: "Explain hybrid search to someone who has only used a vector database. Include why you do not add the two scores.",
        followUp: "Give one query BM25 should win and one a dense retriever should win.",
        hint: "Scales differ.",
        ideal: "Run lexical and dense search, then fuse by rank. BM25 and cosine are different units. Error codes favor BM25. Paraphrases favor dense search. RRF uses positions.",
        topicIds: ["rag-hybrid", "rag-bm25"],
      },
      {
        id: "ai-3",
        prompt: "Walk through self-attention: Q, K, V, the scale, and the mask.",
        followUp: "What happens to cost when the sequence length doubles?",
        hint: "Draw the matrix.",
        ideal: "Project tokens into Q, K, and V. Scores are QKᵀ over sqrt(d), masked, then softmax, then times V. The map is quadratic in sequence length.",
        topicIds: ["llm-attention"],
      },
      {
        id: "ai-4",
        prompt: "What does the GIL change about a Python service that embeds requests and also does a heavy pure-Python ranker?",
        followUp: "Would asyncio fix the ranker?",
        hint: "Waiting versus CPU.",
        ideal: "The HTTP wait can overlap. The pure-Python ranker holds the GIL and blocks other requests. Asyncio does not parallelize that CPU. Move it to a process or shrink it.",
        topicIds: ["py-gil", "py-asyncio"],
      },
      {
        id: "ai-5",
        prompt: "Define faithfulness and correctness. Give an answer that is one but not the other.",
        followUp: "How would you catch that in an eval set?",
        hint: "Evidence versus truth.",
        ideal: "Faithfulness means the answer follows from the supplied context. Correctness means the claim is true. A true fact that was not in the context is unfaithful. Label both.",
        topicIds: ["llm-eval", "rag-eval"],
      },
      {
        id: "ai-6",
        prompt: "An agent deleted the wrong ticket. Where do permissions, validation, and logs have to live so this is harder next time?",
        followUp: "What do you evaluate besides the final sentence?",
        hint: "The runtime, not the prompt.",
        ideal: "The runtime allowlists tools, checks the caller's rights, validates arguments, and logs the trajectory. The prompt is not the control. You score the tool calls, not only the prose.",
        topicIds: ["agent-tools", "agent-prod"],
      },
    ],
  },
  {
    id: "swe",
    name: "Software engineer technical",
    blurb: "APIs, data, Python or TypeScript, and debugging.",
    assistance: "No notes. Examples can be small.",
    questions: [
      {
        id: "swe-1",
        prompt: "A client retries a payment request after a timeout. How do you stop a double charge?",
        followUp: "What do you store, and for how long?",
        hint: "The first request may have succeeded.",
        ideal: "An idempotency key stored with the outcome. A retry returns the stored result and does not charge again. Keep the key longer than the client's retry window. A unique constraint backs it.",
        topicIds: ["be-idem"],
      },
      {
        id: "swe-2",
        prompt: "Explain 401 and 403 with one example each. Where do you check that a user may see this tenant's rows?",
        followUp: "The UI hides the button. Is that enough?",
        hint: "Identity versus permission, then the object.",
        ideal: "401 means unauthenticated. 403 means authenticated and not allowed. Check the tenant on the server for every query. Hiding a button is not authorization.",
        topicIds: ["be-auth"],
      },
      {
        id: "swe-3",
        prompt: "A query filters by tenant_id and created_at and is getting slower. What index do you try, and how do you confirm it?",
        followUp: "Why might the planner ignore it?",
        hint: "Leftmost prefix.",
        ideal: "A composite index on tenant_id then created_at. Confirm with EXPLAIN. A low-selectivity order, a wrapped column, or stale stats can make the planner skip it.",
        topicIds: ["db-index"],
      },
      {
        id: "swe-4",
        prompt: "Two requests read a balance and both write balance + 10. One update disappears. Name the bug and a fix.",
        followUp: "Why is a process-local lock not enough on two servers?",
        hint: "Lost update.",
        ideal: "It is a lost update. Use an atomic SQL update or a transaction that conflicts and retries. A lock inside one process does not exist on the other server.",
        topicIds: ["db-acid", "py-race"],
      },
      {
        id: "swe-5",
        prompt: "Node is 'single-threaded' and your handler calls a synchronous hash of a large file. What do users feel, and what do you change?",
        followUp: "Would a worker thread share your request objects automatically?",
        hint: "The event loop.",
        ideal: "Every request on that process stalls. Hash in a worker or before the request, asynchronously. Workers do not share objects the way a thread does. You pass data.",
        topicIds: ["be-loop"],
      },
      {
        id: "swe-6",
        prompt: "You have an async FastAPI route and a synchronous database driver. What goes wrong, and what is an honest fix?",
        followUp: "Where do you put a job that embeds a PDF?",
        hint: "Blocking the loop.",
        ideal: "The sync driver blocks the event loop. Use an async driver or a thread, or make the route sync under a threadpool worker. PDF embedding belongs on a queue with retries.",
        topicIds: ["be-fastapi", "py-asyncio"],
      },
    ],
  },
  {
    id: "design",
    name: "System design",
    blurb: "One open problem. Requirements before boxes.",
    assistance: "Talk through the design. Do not look up a diagram.",
    questions: [
      {
        id: "sd-1",
        prompt: "Design a RAG service for a company's private documents. Start with requirements and what you are not building.",
        followUp: "A document is deleted. What has to disappear, and what can lag?",
        hint: "Two paths: ingest and query.",
        ideal: "Requirements: cited answers, tenant isolation, daily updates. Non-goals: training a base model. Ingest on a queue. Query path filters by tenant, retrieves, then generates. Deletes remove chunks from every index. Eval gates a release.",
        topicIds: ["sd-rag", "rag-prod"],
      },
      {
        id: "sd-2",
        prompt: "The interviewer changes the prompt: design a URL shortener instead. Give the data model and the first bottleneck.",
        followUp: "How do you keep codes from being trivial to guess, and what do you cache?",
        hint: "Read path versus write path.",
        ideal: "A code points at a URL. Writes are rare, redirects are hot. Cache hot codes. Generate unguessable codes. The bottleneck is the redirect read.",
        topicIds: ["sd-hld", "sd-practice"],
      },
      {
        id: "sd-3",
        prompt: "A region cannot reach the primary database. For a profile read and for placing an order, what do you each do, and why are the answers different?",
        followUp: "Where does CAP actually apply, and where are you just choosing a product behavior?",
        hint: "Per operation.",
        ideal: "Profiles can be stale if the product allows it. Orders should not accept a write you cannot make durable. CAP is the partition choice. The product still decides which operation matters.",
        topicIds: ["sd-dist"],
      },
      {
        id: "sd-4",
        prompt: "Sketch an LLM inference API: gateway, queue, GPU, streaming, and the cost knob you would pull first.",
        followUp: "What memory grows with concurrent conversations?",
        hint: "KV cache.",
        ideal: "Gateway authenticates and limits. A queue feeds workers. Stream tokens. The first cost knob is sending less context and routing easy traffic to a cheaper model. KV cache grows with concurrent sequences.",
        topicIds: ["sd-serve", "llm-infer"],
      },
    ],
  },
  {
    id: "coding",
    name: "Machine coding",
    blurb: "Implement from a problem statement. Assistance only if the problem allows it.",
    assistance: "Open the build exercise beside this mock. Independent exercises stay unaided.",
    questions: [
      {
        id: "code-1",
        prompt: "Implement an LRU cache with O(1) get and put. Talk through the structures before you write them.",
        followUp: "What changes if put updates a key that is already present?",
        hint: "Two structures.",
        ideal: "A hash map plus a doubly linked list. Get and put move the node to the front. An update must not increase size. Capacity 1 is the revealing test.",
        topicIds: ["mc-lru"],
      },
      {
        id: "code-2",
        prompt: "Write a retry helper. Transient failures retry with backoff. A validation error does not. Tests must not sleep.",
        followUp: "What do you inject?",
        hint: "The clock.",
        ideal: "Inject the sleeper. Classify by error type. Double the delay after failures. Raise the last error when the budget ends.",
        topicIds: ["mc-retry"],
      },
      {
        id: "code-3",
        prompt: "Design the claim step of a job worker so two processes cannot run one job. You may use SQL.",
        followUp: "The handler throws. What is stored?",
        hint: "Conditional update.",
        ideal: "UPDATE the row from queued to running with a condition and RETURNING. Zero rows means you lost the claim. Store the exception and a failed status. Do not select then update unprotected.",
        topicIds: ["mc-jobs", "db-acid"],
      },
      {
        id: "code-4",
        prompt: "You may use an assistant for this one. Specify a tiny RAG index with rank fusion and the tests you want before any code is generated.",
        followUp: "Which test proves you did not add the raw scores together?",
        hint: "Fixtures for each retriever.",
        ideal: "Write the tests and the fusion rule first. One fixture only lexical search can win. Assert the fused order. Then let the assistant draft against those tests and review the diff.",
        topicIds: ["mc-rag", "tools-assist"],
      },
    ],
  },
  {
    id: "loop",
    name: "Full loop",
    blurb: "A remote startup loop, compressed: introduction through behavior.",
    assistance: "Treat it as the real loop. One answer at a time.",
    questions: [
      {
        id: "loop-1",
        prompt: "Introduce yourself in under two minutes for a remote AI engineer role. Include what you want next.",
        followUp: "What part of that should I push on?",
        hint: "Facts, not adjectives.",
        ideal: "Current work, one system you shipped, the decision you made, and the role you want. No unsupported superlatives.",
        topicIds: ["career-story"],
      },
      {
        id: "loop-2",
        prompt: "Pick a project. What was the request path, what did you decide, and what broke or would break?",
        followUp: "What would you change with twice the traffic?",
        hint: "Your boundary.",
        ideal: "Path, data, your decision, the alternative, a real limit. Mark what you did not own.",
        topicIds: ["career-story", "sd-hld"],
      },
      {
        id: "loop-3",
        prompt: "A customer says the assistant quoted a policy you deleted yesterday. What do you inspect, in order?",
        followUp: "How would you confirm the fix with an eval, not a vibe?",
        hint: "Trace, then index.",
        ideal: "Open the trace: retrieved ids, then the prompt, then the answer. Suspect a stale chunk. Check delete propagation. Add the case to the golden set.",
        topicIds: ["rag-obs", "rag-prod"],
      },
      {
        id: "loop-4",
        prompt: "Write a SQL shape for messages in a room with membership. How do you stop a non-member from reading them?",
        followUp: "What index matches the list query?",
        hint: "Authz in the query path.",
        ideal: "Messages belong to a room. Membership is a table. Every select joins or filters membership for the current user. Index the lookup you actually run.",
        topicIds: ["db-sql", "be-auth"],
      },
      {
        id: "loop-5",
        prompt: "Given a sorted array, find if a pair sums to a target. State the complexity and the bug you are most likely to write.",
        followUp: "What if the array is not sorted and you may not sort it because indexes must be preserved in a different problem?",
        hint: "Two pointers, then hashing.",
        ideal: "Sort if allowed, then two pointers, O(n log n) or O(n) after sorting is already done. The bug is moving the wrong pointer. If you need original indexes, use a hash map.",
        topicIds: ["dsa-two-pointers", "dsa-hash"],
      },
      {
        id: "loop-6",
        prompt: "Design the read path of a notification service that must not block the action that created the notification.",
        followUp: "The sender is down. What does the user who clicked the button experience?",
        hint: "Queue.",
        ideal: "Commit the business action, enqueue the notification, return. The user is not coupled to the sender. Retries and a dead letter handle the outage. Status is visible if the product needs it.",
        topicIds: ["sd-pieces", "be-arch"],
      },
      {
        id: "loop-7",
        prompt: "Tell me about a production problem you debugged. Keep the wrong hypothesis in the story.",
        followUp: "What did you change so the same class of bug is louder next time?",
        hint: "Timeline.",
        ideal: "Symptom, first wrong idea, the check that killed it, the real cause, the fix, and the log or test you added.",
        topicIds: ["career-behavior", "py-debug"],
      },
      {
        id: "loop-8",
        prompt: "You are remote and the only person awake. A decision is needed from a teammate in another timezone. What do you write before you block?",
        followUp: "When do you proceed anyway?",
        hint: "Status and a default.",
        ideal: "Write the context, the options, the deadline, and the default you will take if they do not reply. Proceed when the default is reversible and you said so.",
        topicIds: ["career-behavior"],
      },
    ],
  },
];

export function mockById(id: string) {
  return mocks.find((mock) => mock.id === id);
}

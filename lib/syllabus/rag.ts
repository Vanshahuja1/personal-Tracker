import type { Module } from "@/lib/types";
import { topic } from "@/lib/syllabus/build";

const ai = ["ai"] as const;

export const ragModules: Module[] = [
  {
    id: "rag-foundations",
    name: "Foundations",
    topics: [
      topic({
        id: "rag-fundamentals",
        name: "RAG fundamentals",
        priority: "P0",
        tracks: ["ai"],
        objectives: [
          "Explain why a model answers from retrieved context instead of weights alone",
          "Draw the index path and the query path as two separate pipelines",
          "Name what RAG fixes and what it does not fix",
        ],
        beginner:
          "A language model only knows what was in its training data, and that knowledge is frozen. Retrieval-augmented generation fetches passages from your documents at question time and asks the model to answer from those passages.",
        technical:
          "RAG is a retrieve-then-read pipeline. Offline, documents are parsed, chunked, embedded, and stored with metadata. Online, the user query is embedded or rewritten, nearest chunks are selected, and those chunks are placed in the prompt as grounded context.",
        internals:
          "The generator never 'sees' your database. It sees a string. Retrieval quality is therefore a ranking problem, and generation quality is a reading problem. Most production failures are bad retrieval, not a weak chat model.",
        flow:
          "Ingest and chunk, embed, upsert to a vector index, embed the query, retrieve top-k, optionally rerank, build a prompt with citations, generate, then log query, chunk ids, and the answer for evaluation.",
        useCases: [
          "Answer questions over private docs, tickets, or contracts that must not be baked into model weights",
          "Cite a source so a reviewer can check the claim",
        ],
        terms: [
          ["Index path", "Offline work that turns documents into searchable chunks."],
          ["Query path", "Online work from a user question to a grounded answer."],
          ["Grounding", "The answer is constrained to retrieved text, not the model's memory."],
          ["Top-k", "How many chunks you pass to the model. More context is not automatically better."],
        ],
        performance: [
          "Latency is embed + search + rerank + generation. Generation usually dominates unless the index is cold or enormous.",
          "Cost scales with retrieved tokens sent to the model, not with how many vectors you store.",
        ],
        limits: [
          "RAG does not update the model's weights. It also fails when the answer is not in the corpus, or when the right fact is split across chunks.",
          "It does not make a model honest. The model can still ignore the context.",
        ],
        alternatives: [
          "Long-context stuffing of the whole corpus, when the corpus is small",
          "Fine-tuning, when you need behavior or style, not fresh facts",
        ],
        tradeoffs: [
          "Fine-tuning memorizes slowly and expensively. RAG updates when you reindex.",
          "Bigger k raises recall and also noise, cost, and the chance the model attends to the wrong passage.",
        ],
        practice: [
          "Sketch index path and query path for a PDF policy bot. Mark which steps are offline.",
          "List three questions your bot must refuse because the corpus does not contain the answer.",
        ],
        fundamental: [
          ["What problem does RAG solve?", "It lets a model answer from a private, changing corpus without retraining. You retrieve relevant text and put it in the prompt so the model reads evidence instead of guessing from pretraining."],
          ["What is the difference between the index path and the query path?", "The index path parses, chunks, embeds, and stores documents ahead of time. The query path embeds or rewrites one question, searches, optionally reranks, and generates. Mixing them up leads people to re-embed the whole corpus on every question."],
          ["When is RAG the wrong tool?", "When you need the model to learn a new skill or format, when the corpus is tiny enough to fit in context, or when the question needs computation rather than a passage. RAG is for knowledge lookup, not for teaching arithmetic or a new dialect of your API."],
          ["Why do citations matter?", "A citation is the chunk id or source span the answer came from. It lets a human check the claim and lets you measure faithfulness. An answer with no pointer is not grounded, even if it sounds right."],
        ],
        intermediate: [
          ["Where does most RAG quality actually come from?", "From chunk boundaries, metadata, query formulation, and ranking. The chat model is usually the last 20 percent. If the right sentence is missing from the prompt, no system prompt will invent a faithful answer."],
          ["How do you keep the model from answering outside the context?", "Tell it to abstain when the context is insufficient, ask for quotes, and evaluate faithfulness on a labeled set. Instructions help. Retrieval metrics and refusal tests prove it."],
        ],
        scenario: [
          ["Your bot confidently answers a policy question that is not in the handbook. What do you inspect first?", "The retrieved chunks. If the right policy was not retrieved, fix chunking, metadata, or the query. If it was retrieved and ignored, fix the prompt and add a faithfulness check. Do not start by swapping the chat model."],
        ],
        followUp: [
          ["The interviewer says 'so RAG eliminates hallucinations.' What do you say?", "No. RAG reduces ungrounded answers when retrieval is relevant and the model is required to stick to it. The model can still misread, merge two chunks, or answer from memory. You measure faithfulness. You do not claim it is gone."],
        ],
        mistakes: [
          "Treating RAG as a prompt trick instead of a search system",
          "Blaming the LLM when the retrieved set never contained the fact",
          "Stuffing 30 chunks into the prompt and calling it higher quality",
        ],
        conceptual: [
          ["Name the two pipelines in a RAG system.", "Index path and query path."],
          ["What does grounding mean?", "The answer is based on retrieved text that you can point to."],
          ["Does RAG update model weights?", "No. It changes the prompt context at request time."],
          ["What is top-k?", "The number of chunks selected and usually passed to the generator."],
          ["Why can a correct corpus still produce a wrong answer?", "The right chunk was not retrieved, or it was retrieved and the model did not use it."],
        ],
        practical: [
          ["A new PDF is uploaded. Which path runs?", "The index path: parse, chunk, embed, upsert."],
          ["A user asks a question. Which path runs?", "The query path: rewrite or embed, search, maybe rerank, generate."],
          ["You want yesterday's policy to be answerable today. What do you avoid?", "Waiting for a fine-tune. Reindex the new document."],
        ],
        advanced: [
          ["Recall went up and answer quality went down. Why is that possible?", "A larger or noisier context dilutes attention and adds distractors. Ranking quality matters more than raw recall."],
          ["When would you skip retrieval?", "Greetings, questions about the conversation itself, or when a classifier says the corpus cannot contain the answer."],
        ],
      }),
      topic({
        id: "rag-ingestion",
        name: "Document ingestion",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Describe how a file becomes an index record", "Separate parsing failures from retrieval failures"],
        beginner: "Ingestion is the door. If a PDF never becomes clean text, no retriever can find it.",
        technical: "A worker accepts a file or URL, stores the original, extracts text and structure, attaches metadata, and hands chunks to the embedder. It must be idempotent: the same document version should not create duplicate vectors.",
        internals: "Keep the raw object, the extracted text, and the chunk rows as different artifacts. When extraction improves, you reprocess from the raw file instead of hoping the old chunks are fine.",
        flow: "Upload, hash the bytes, skip if that version is already indexed, extract, record page or section offsets, chunk, embed, upsert, mark the document ready.",
        useCases: ["Nightly sync from a knowledge base", "User upload in a support bot"],
        terms: [
          ["Document version", "A content hash or revision id. Reindex when it changes."],
          ["Idempotent upsert", "Writing the same version twice does not duplicate chunks."],
          ["Source of record", "The original file, not the extracted text."],
        ],
        limits: ["Scanned pages without OCR produce empty chunks.", "Huge files need a queue, not a request thread."],
        practice: ["List the artifacts you store for one PDF: original, text, chunks, embeddings."],
        fundamental: [
          ["Why store the original file?", "Extraction changes. You want to re-run parsing without asking the user to upload again."],
          ["What does idempotent ingestion mean?", "Reprocessing the same document version replaces or no-ops. It does not append a second copy of every chunk."],
        ],
        mistakes: ["Indexing empty extracts and then debugging the retriever", "Using the filename as the only id"],
        conceptual: [
          ["What is the source of record?", "The original uploaded bytes or upstream document."],
          ["When do you reindex?", "When the content hash or revision changes, or when the chunker changes."],
          ["Why a queue?", "Parsing and embedding are slow and bursty."],
        ],
        practical: [
          ["OCR returns nothing. Where do you stop the pipeline?", "Before embed. Mark the document failed extraction."],
        ],
        advanced: [
          ["Two workers ingest the same file. What constraint saves you?", "A unique key on document id plus content hash, and upserts keyed by chunk id."],
        ],
      }),
      topic({
        id: "rag-parsing",
        name: "Parsing and preprocessing",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Choose a parser for text, HTML, and PDF", "Preserve structure that retrieval needs"],
        beginner: "Parsing turns a file format into text plus structure: headings, tables, pages. Preprocessing cleans that text without deleting the meaning.",
        technical: "HTML needs boilerplate removal. PDFs need reading order. Tables should stay tables or become explicit rows, not a soup of numbers. Keep heading paths so a chunk knows it lives under 'Refunds / EU'.",
        internals: "Strip repeated headers and footers. Normalize whitespace. Do not lowercase text you will show to the model. Keep offsets back to the source so citations can highlight a page.",
        flow: "Detect type, extract blocks in reading order, attach heading hierarchy and page number, drop nav chrome, then hand blocks to the chunker.",
        useCases: ["Policy PDFs with headers on every page", "Docs sites full of nav links"],
        terms: [
          ["Reading order", "The sequence a human reads, which is not always the PDF's raw text order."],
          ["Boilerplate", "Nav, footers, and cookie banners that pollute embeddings."],
          ["Provenance", "Page, section, and source URL stored with the text."],
        ],
        limits: ["Multi-column PDFs and scans are where naive parsers scramble facts."],
        practice: ["Take one messy PDF page and write the metadata you would store with each block."],
        fundamental: [
          ["Why not just extract all text?", "Order, headings, and tables are the difference between a searchable fact and a bag of tokens."],
        ],
        mistakes: ["Embedding the table of contents and the footer on every page", "Dropping heading context so every chunk says 'click here'"],
        conceptual: [
          ["What is boilerplate?", "Repeated chrome that is not the document's content."],
          ["Why keep page numbers?", "Citations and debugging."],
        ],
        practical: [
          ["A table of prices was flattened into one line. What broke?", "The parser lost cell structure, so values are no longer tied to row headers."],
        ],
        advanced: [
          ["When do you parse with a layout model instead of a text extractor?", "When columns, figures, or scanned pages make reading order unreliable."],
        ],
      }),
    ],
  },
  {
    id: "rag-index",
    name: "Indexing",
    topics: [
      topic({
        id: "rag-chunking",
        name: "Chunking strategies",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Pick a chunk size for a real document type", "Explain overlap, parent chunks, and structure-aware splits"],
        beginner: "A chunk is the unit you search and the unit you show the model. Too small and the fact is cut in half. Too large and the embedding represents several topics at once.",
        technical: "Fixed windows are simple and usually wrong for structured docs. Split on headings, paragraphs, or sentences, then cap size. Overlap keeps a sentence that sits on a boundary. Parent-child retrieval searches small children and returns the parent section for context.",
        internals: "The embedding is a single vector for the whole chunk. If a chunk mixes refund policy and shipping policy, the vector sits between them and matches neither query well. Structure-aware splits follow the document's own boundaries.",
        flow: "Choose a boundary, pack until the token budget, carry overlap, store heading path and parent id, embed the child, and be able to expand to the parent at prompt time.",
        useCases: ["API docs split by endpoint", "Contracts split by clause, not by 500 characters"],
        terms: [
          ["Overlap", "Tokens repeated at the edge so a boundary does not eat a sentence."],
          ["Parent chunk", "A larger section returned after a small chunk matches."],
          ["Structure-aware split", "Breaking on headings, clauses, or functions instead of a raw character count."],
        ],
        performance: ["More, smaller chunks increase index size and search fan-out. They often raise recall if parents are expanded."],
        limits: ["No chunk size is universal. Code, chats, and legal clauses want different boundaries."],
        alternatives: ["Late chunking and proposition indexing, when you can afford a heavier index path"],
        tradeoffs: ["Small chunks retrieve precisely and read poorly. Large chunks read well and retrieve vaguely."],
        practice: ["Chunk a README both by heading and by 400 tokens. Write which query each scheme would miss."],
        fundamental: [
          ["Why does chunk size change retrieval?", "The vector has to stand for everything in the chunk. Mixed topics blur the nearest-neighbor match."],
          ["What is overlap for?", "To keep a sentence or step that would otherwise be sliced onto two chunks, only one of which matches."],
          ["What is parent-child chunking?", "Search a precise child span, then give the model the surrounding parent so the answer has context."],
        ],
        intermediate: [
          ["How do you choose a size without folklore?", "Label 30 real questions with the passage that answers them. Try two splitters. Measure recall of that passage, not your vibe."],
        ],
        scenario: [
          ["Answers quote half a sentence and miss the exception in the next paragraph. What do you change?", "Widen the chunk or return the parent section. The exception was cut off. Do not start by changing the embedding model."],
        ],
        followUp: [
          ["Is 512 tokens the right default?", "It is a starting budget, not a design. The document's structure decides the split. The token cap only stops a section from becoming a novel."],
        ],
        mistakes: ["One global chunk size for code, PDF, and chat", "Overlap so large that you pay to index the same text three times", "Searching parents only, so precise lines never win"],
        conceptual: [
          ["What does one embedding represent?", "The whole chunk, not each sentence separately, unless you built it that way."],
          ["Why do mixed-topic chunks fail?", "The vector is a compromise and matches neither query cleanly."],
          ["What is a parent chunk?", "The larger section you can expand to after a small hit."],
          ["What is overlap?", "Shared edge tokens between neighboring chunks."],
          ["Name a structure you should split on.", "Headings, paragraphs, clauses, or function boundaries."],
        ],
        practical: [
          ["Refunds and shipping landed in one chunk. What symptom do you see?", "Queries for either topic retrieve a muddy chunk or the wrong one."],
          ["You only stored character offsets and lost the heading. What gets worse?", "The model cannot tell which policy a short chunk belongs to."],
          ["When would you index code by function?", "When questions are about one function and a file-level chunk would mix unrelated helpers."],
        ],
        advanced: [
          ["Recall of the gold passage is high, answers are still vague. Where do you look?", "The chunk may contain the fact but not the definition it depends on. Expand context or fix the split."],
          ["You changed the chunker. What must be rebuilt?", "Chunk ids, embeddings, and any eval set that points at old ids."],
        ],
      }),
      topic({
        id: "rag-embeddings",
        name: "Embedding models",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Explain what a text embedding is", "Choose and evaluate a model for your corpus"],
        beginner: "An embedding model turns text into a list of numbers so that similar meanings land near each other. Search becomes nearest neighbor instead of shared keywords.",
        technical: "Most retrieval models are bi-encoders: one vector for the query, one for the passage, compared with cosine or dot product. They are trained so matching pairs score higher than random pairs. The vector is not a summary a human reads. It is a ranking feature.",
        internals: "Pooling, normalization, and dimension are part of the model contract. You cannot mix vectors from two models in one index. Cosine after normalization is dot product. A model trained on questions against passages behaves differently from one trained on symmetric similarity.",
        flow: "Pick a model, embed a golden set of queries and passages, measure recall@k, then embed the corpus once and store the model name and dimension beside the index.",
        useCases: ["Semantic match when the user does not use the document's words", "Clustering duplicate tickets"],
        terms: [
          ["Bi-encoder", "Separate vectors for query and document, compared by a distance."],
          ["Cross-encoder", "Scores one pair at a time. Used to rerank, not to index a million docs."],
          ["Dimension", "Length of the vector. Fixed per model."],
          ["Normalization", "Scaling a vector to unit length so dot product equals cosine."],
        ],
        performance: ["Embedding the corpus is the expensive index step. Query embedding is one call per search."],
        limits: ["Embeddings miss exact identifiers, error codes, and rare strings. That is why hybrid search exists."],
        alternatives: ["Sparse lexical search, or a cross-encoder over a small candidate set"],
        tradeoffs: ["Larger models often rank better and cost more latency and memory."],
        practice: ["Write five queries that share no keywords with the answer sentence. Those are the ones dense search must win."],
        fundamental: [
          ["What does an embedding measure?", "A trained notion of similarity. Near vectors are similar in the way the model was trained, which is not always factual identity."],
          ["Why can't you mix two embedding models in one index?", "The dimensions and the geometry are different. Distances between them are meaningless."],
          ["Why do embeddings fail on SKUs and error codes?", "Those tokens are rare and lexical. The model may map them poorly, while BM25 matches the exact string."],
        ],
        mistakes: ["Assuming a higher dimension is always more accurate", "Changing models and leaving old vectors in the index"],
        conceptual: [
          ["What is a bi-encoder?", "A model that embeds query and document separately."],
          ["What is a cross-encoder good for?", "Reranking a short list, not indexing everything."],
          ["What breaks if you switch models?", "Every stored vector must be recomputed."],
        ],
        practical: [
          ["Queries use different words than the docs and lexical search fails. What do you add?", "A dense embedding retriever, then combine it with lexical search."],
        ],
        advanced: [
          ["Your model was trained on symmetric sentence similarity, but you retrieve passages for questions. Why might that disappoint?", "The training geometry does not match asymmetric question-to-passage search."],
        ],
        refs: [{ id: "rag-hybrid", note: "Dense vectors are one side of hybrid search." }],
      }),
      topic({
        id: "rag-vectordb",
        name: "Vector databases",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Compare FAISS, pgvector, Qdrant, and Chroma for a product", "Say what you store besides the vector"],
        beginner: "A vector database stores embeddings and finds the nearest ones. It is an index with metadata, not a magic memory.",
        technical: "FAISS is a library you embed in a process. pgvector keeps vectors beside relational data in Postgres. Qdrant is a dedicated service with payload filters. Chroma is a simple local or small-app store. The choice is about filters, operations, and where the rest of your data lives.",
        internals: "You store id, vector, text, and payload: source, version, tenant, heading. Filtering happens with the search, not after you hoped the neighbor was in the right tenant.",
        flow: "Create a collection with a fixed dimension and distance, upsert by stable chunk id, search with a filter, return ids and payloads.",
        useCases: ["Multi-tenant support bot on Postgres you already run", "A dedicated ANN service when search QPS outgrows the primary database"],
        terms: [
          ["Payload", "Metadata stored next to the vector and usable as a filter."],
          ["ANN", "Approximate nearest neighbor. Fast search that may not be the exact nearest set."],
          ["Tenant key", "An id that must be in every filter so customers never see each other's chunks."],
        ],
        limits: ["An ANN index can miss the true neighbor. Exact search is safer at small scale and slower at large scale."],
        tradeoffs: ["pgvector keeps one database to operate. A dedicated engine filters and scales search with fewer compromises."],
        practice: ["Pick pgvector or Qdrant for a multi-tenant bot and write the reason in four lines."],
        fundamental: [
          ["Is FAISS a database?", "No. It is a similarity-search library. You still need storage, ids, and a way to update vectors."],
          ["What must every search include in a multi-tenant app?", "A filter on the tenant id. Similarity is not an access-control system."],
        ],
        mistakes: ["Filtering in application code after taking a global top-k", "No stable chunk id, so updates create duplicates"],
        conceptual: [
          ["What is a payload?", "Filterable metadata stored with the vector."],
          ["What is ANN?", "Approximate nearest neighbor search."],
          ["Name one reason to use pgvector.", "Vectors live next to the relational data you already query."],
        ],
        practical: [
          ["Top-k from the whole index includes another customer's docs. What did you forget?", "The tenant filter on the search itself."],
        ],
        advanced: [
          ["When is exact search acceptable?", "When the collection is small enough that a sequential or exact index meets the latency budget."],
        ],
      }),
      topic({
        id: "rag-similarity",
        name: "Similarity metrics",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Choose cosine, dot product, or L2 for a model", "Explain why the metric must match training"],
        beginner: "A similarity metric is the rule that says which vectors are close. The model was trained with one rule. Your index has to use that same rule.",
        technical: "Cosine ignores magnitude and compares angle. Dot product uses angle and magnitude. L2 is straight-line distance. If the model normalizes vectors, cosine and dot product rank the same.",
        internals: "Some ANN indexes implement cosine by normalizing and then using inner product. If you normalize twice or not at all, ranking changes.",
        flow: "Read the model card, set the collection distance to match, normalize if required, and do not compare raw scores across different metrics.",
        useCases: ["Any dense retrieval index"],
        terms: [
          ["Cosine", "Angle between vectors. Magnitude does not matter."],
          ["Dot product", "Inner product. Sensitive to magnitude unless vectors are normalized."],
          ["L2", "Euclidean distance. Smaller is closer."],
        ],
        limits: ["A higher score is not a probability. You cannot threshold 0.8 across models and call it confidence."],
        practice: ["Explain why two normalized vectors make cosine and dot product agree."],
        fundamental: [
          ["Why must the metric match the model?", "The model learned to push true pairs together under a specific geometry. A different metric asks a different question."],
        ],
        mistakes: ["Treating a cosine of 0.8 as an 80 percent chance the chunk is relevant"],
        conceptual: [
          ["What does cosine ignore?", "Vector magnitude."],
          ["When do cosine and dot product rank the same?", "When vectors are normalized to the same length."],
        ],
        practical: [
          ["You switched from cosine to L2 and quality collapsed. What do you check?", "The model card's intended distance, and whether vectors were normalized."],
        ],
        advanced: [
          ["Why is a similarity score a bad abstain threshold by itself?", "Scores are not calibrated probabilities and shift with query type and index contents."],
        ],
      }),
      topic({
        id: "rag-vector-search",
        name: "Vector search",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Describe approximate nearest neighbor search", "Explain HNSW at interview depth"],
        beginner: "Vector search finds stored chunks whose embeddings are closest to the query embedding. At large scale you accept an approximate answer so the search stays fast.",
        technical: "Exact search compares the query with every vector. Approximate indexes such as HNSW build a graph of neighbors and walk it. You tune how wide the walk is. A wider walk is slower and closer to exact.",
        internals: "HNSW has layers of graphs. Search starts at the top layer and descends. Parameters such as ef_search trade latency for recall. The index must be rebuilt or updated when vectors change. Deletes leave holes unless the engine compacts.",
        flow: "Embed query, run ANN with a metadata filter, take a candidate set larger than the final k, then rerank or fuse with lexical results.",
        useCases: ["Find policy chunks that paraphrase the user's question"],
        terms: [
          ["HNSW", "A layered graph index for approximate nearest neighbors."],
          ["ef_search", "How many candidates the walk explores. Higher recalls more and costs more."],
          ["Recall of the index", "How often the true nearest neighbors appear in the approximate result."],
        ],
        performance: ["Filter selectivity can dominate. A rare tenant should not scan the global graph and then throw rows away."],
        limits: ["ANN can miss the best chunk. Measure index recall on your data before you blame the embedding model."],
        tradeoffs: ["Memory-heavy graph indexes are fast. Flat exact indexes are simple and complete."],
        practice: ["Explain HNSW in four sentences as if the interviewer has not read the paper."],
        fundamental: [
          ["Why approximate search?", "Exact comparison against millions of vectors misses the latency budget. ANN returns a very good set quickly."],
          ["What do you tune when ANN misses known neighbors?", "The search breadth, such as ef_search, or you fall back toward exact search for that collection size."],
        ],
        mistakes: ["Assuming the top hit is the true nearest neighbor without measuring it", "Applying filters after a global search"],
        conceptual: [
          ["What does vector search return?", "The ids of chunks nearest to the query vector."],
          ["What is HNSW?", "A graph-based approximate nearest neighbor index."],
          ["What does a wider search buy?", "Higher recall, higher latency."],
        ],
        practical: [
          ["A labeled neighbor is in the index but never returned. Name two causes.", "ANN parameters are too narrow, or the metadata filter excluded it."],
        ],
        advanced: [
          ["Why can post-filtering break ANN?", "The graph walk may spend its budget on vectors you later discard, so the tenant's true neighbors never get visited."],
        ],
      }),
      topic({
        id: "rag-metadata",
        name: "Metadata filtering",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Use filters for tenant, type, time, and access", "Explain pre-filter versus post-filter"],
        beginner: "Metadata is everything you know about a chunk besides its text: who may see it, when it was written, which product it belongs to. Filters keep search inside that fence.",
        technical: "A filter is a predicate applied with the vector search. Pre-filtering restricts the candidates the index walks. Post-filtering takes a global top-k and drops rows, which can leave you with zero hits even though valid chunks exist.",
        internals: "Store tenant, acl, source, version, language, and timestamps as payload fields. Do not encode access control only in the prompt. The retriever must not fetch forbidden text at all.",
        flow: "Resolve the caller's permissions, build a filter, search inside it, then expand parents that pass the same filter.",
        useCases: ["Only this customer's documents", "Only the policy version that was active on the date they ask about"],
        terms: [
          ["Pre-filter", "Constrain the index walk so discarded rows do not consume the search budget."],
          ["Post-filter", "Drop rows after search. Dangerous when the match set is sparse."],
          ["ACL", "Who is allowed to read the chunk."],
        ],
        limits: ["Too many high-cardinality filters need an engine that actually indexes those fields."],
        practice: ["Write the filter for: tenant A, product billing, documents updated after March, caller is not an admin of other tenants."],
        fundamental: [
          ["Why is filtering in the prompt not enough?", "The model has already seen the forbidden chunk. Access control has to happen at retrieval."],
          ["Why can post-filtering return nothing?", "The global top-k was full of other tenants' closer vectors, and the valid ones were never fetched."],
        ],
        mistakes: ["Trusting the model not to mention a chunk you already inserted", "Forgetting version filters and answering from a retired policy"],
        conceptual: [
          ["What is a payload filter?", "A constraint on metadata during search."],
          ["Which is safer for tenants, pre-filter or post-filter?", "Pre-filter."],
          ["Name three fields you would store.", "Tenant, source, and version or timestamp."],
        ],
        practical: [
          ["An ex-employee's private notes show up in answers. What failed?", "The ACL filter. Those chunks should not have been retrieved."],
        ],
        advanced: [
          ["How do you test a filter without reading every answer?", "Query as two tenants and assert the chunk ids never cross."],
        ],
      }),
    ],
  },
  {
    id: "rag-retrieval",
    name: "Retrieval strategies",
    topics: [
      topic({
        id: "rag-hybrid",
        name: "Hybrid search",
        priority: "P0",
        tracks: [...ai],
        objectives: [
          "Explain why dense and sparse retrieval fail in different ways",
          "Combine them with a fusion method such as reciprocal rank fusion",
          "Decide what belongs in each index and how you will measure the mix",
        ],
        beginner:
          "Hybrid search asks two librarians the same question. One matches exact words. One matches meaning. You merge their lists so a query can win with either kind of evidence.",
        technical:
          "Sparse retrieval, usually BM25, scores shared terms and is strong on names, error codes, and rare tokens. Dense retrieval embeds the query and the chunk and is strong when the user paraphrases. Hybrid search runs both, then fuses the ranked lists into one candidate set before reranking or generation.",
        internals:
          "The two scores are not in the same unit. BM25 is an unbounded term statistic. Cosine sits in a small range. Adding them raw lets one side drown the other. Fusion by rank, or a calibrated weighted sum after you rescale scores, is the part you must be able to defend.",
        flow:
          "Rewrite or keep the raw query, run BM25 and vector search with the same metadata filter, take a candidate window from each, fuse, optionally rerank the fused list with a cross-encoder, then cut to the context budget.",
        useCases: [
          "Support search where users paste an error code or describe the symptom in their own words",
          "Internal docs where a feature has a code name in the text and a plain-English name in the question",
        ],
        terms: [
          ["Sparse retrieval", "Ranking from term overlap. BM25 is the usual choice."],
          ["Dense retrieval", "Ranking from embedding distance."],
          ["Reciprocal rank fusion", "A way to merge lists using rank position, not raw score. A document at rank r contributes 1 / (k + r)."],
          ["Alpha", "A weight if you blend dense and sparse scores after scaling them. It is a tuned number, not a law."],
        ],
        performance: [
          "You pay two searches plus fusion. That is usually cheap next to generation. The expensive upgrade is a cross-encoder over the fused window.",
          "Candidate windows that are too small defeat fusion: the right hit never enters the merge.",
        ],
        limits: [
          "Hybrid search does not repair a bad chunker. Both indexes see the same bad chunks.",
          "If both sides miss the fact, fusion has nothing to promote. You still need query rewriting or better coverage.",
        ],
        alternatives: [
          "Dense only, when the corpus has no important exact tokens",
          "Sparse only, when queries are codes, ids, and legal phrases copied from the source",
          "A learned ranker on top of both, once you have click or label data",
        ],
        tradeoffs: [
          "Rank fusion is robust and needs little tuning. A weighted sum can do better once scores are calibrated, and it can also be silently wrong if one score scale shifts.",
          "A wider candidate window raises the chance the cross-encoder sees the right chunk, and it raises rerank cost.",
        ],
        practice: [
          "Write ten real queries: five that only BM25 should win, five that only dense search should win. Run both and see if your fusion keeps the winner.",
          "Implement reciprocal rank fusion on paper for two lists of five ids and compute the merged order with k = 60.",
        ],
        snippet: {
          caption: "Reciprocal rank fusion. Rank is 1-based. k = 60 is a common dampener, not a sacred constant.",
          code: `def rrf(rankings: list[list[str]], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)`,
        },
        fundamental: [
          [
            "What is hybrid search?",
            "It runs a lexical ranker and a vector ranker on the same query and merges the results. Lexical search catches exact tokens. Vector search catches paraphrases. The merge is the product decision, because the two scores are not comparable out of the box.",
          ],
          [
            "Why not add BM25 and cosine together?",
            "They are different scales. A BM25 of 12 and a cosine of 0.4 do not live on one number line. One side will dominate for almost every query, and you will think the other index is useless. Fuse by rank, or rescale both scores on a held-out set before you weight them.",
          ],
          [
            "What is reciprocal rank fusion?",
            "For each list, a document at rank r adds 1 / (k + r) to its total. Documents that appear near the top of either list rise. Raw scores never enter the formula, so you do not need to calibrate BM25 against cosine. k, often 60, stops the first position from taking the entire blend.",
          ],
          [
            "When does dense search lose to BM25?",
            "When the discriminative token is rare: an error code, a SKU, a function name, a clause number. The embedding may treat that token as noise. BM25 treats a rare shared term as strong evidence. Hybrid search exists so you do not have to guess which query you will get.",
          ],
          [
            "When does BM25 lose to dense search?",
            "When the user and the document use different words for the same fact. 'Cancel my plan' may need a chunk that only says 'terminate the subscription'. There is no term overlap for BM25 to score. The embedding can still place them near each other if it was trained for that kind of paraphrase.",
          ],
          [
            "Does hybrid search replace a reranker?",
            "No. Fusion builds a better candidate pool. A cross-encoder reranker reads the query and each candidate together and reorders that pool. Fusion is cheap and global. Reranking is expensive and precise, so you run it on dozens of rows, not on the whole corpus.",
          ],
        ],
        intermediate: [
          [
            "How do you choose the candidate window?",
            "Take enough from each side that the gold chunk is usually inside the window on a labeled set, and few enough that the reranker or the context budget can still read them. If gold chunks sit at rank 80 of either list, fusion of the top 10 cannot save them. Measure recall of the fused window before you argue about alpha.",
          ],
          [
            "How do metadata filters interact with hybrid search?",
            "Both searches must use the same filter. If BM25 is tenant-scoped and vector search is global, fusion will launder another tenant's chunk into the list. Apply the filter inside each retriever, then fuse. Do not fuse first and filter as a cleanup step.",
          ],
          [
            "What do you store so you can debug a bad blend?",
            "The query, both ranked id lists, the fused order, the reranked order, and the chunk ids that reached the prompt. Without the two input lists you cannot tell whether fusion dropped a hit or the generator ignored it.",
          ],
          [
            "A weighted sum beat RRF on your eval last month and loses this month. What happened?",
            "Score scales drifted. You changed the embedding model, the BM25 parameters, or the query length, and a hand-tuned alpha no longer means what it meant. Rank fusion is less sensitive to that. If you keep weights, recalibrate them when either retriever changes.",
          ],
        ],
        scenario: [
          [
            "Users paste stack traces and also ask vague how-to questions. Dense-only search is uneven. What do you ship?",
            "A hybrid index over the same chunks. Let BM25 carry the stack traces and function names. Let dense search carry the how-to paraphrases. Fuse with RRF, keep a shared metadata filter, and judge the blend on a set that contains both query types. If how-to questions still fail, the chunks are probably too broad, which hybrid search will not fix.",
          ],
          [
            "After you add BM25, exact-match queries improve and some semantic queries get worse. Why?",
            "Fusion is promoting a lexical lookalike that shares a rare word and is the wrong section. Your window or your weight favors sparse hits. Inspect the two lists for a failed semantic query. You may need a reranker, a different k in RRF, or a rule that prefers dense order when the query has no rare tokens.",
          ],
          [
            "Leadership wants one relevance number to show in the UI. What do you refuse to do?",
            "You refuse to display a raw BM25 plus cosine sum as a confidence percentage. It is not calibrated. If the product needs a number, calibrate a probability on labeled data and say what it means. Otherwise show the source and let the answer abstain when the fused set is weak.",
          ],
        ],
        followUp: [
          [
            "Could you skip BM25 and just add the keywords to the embedding text?",
            "Repeating a code in the chunk can help the encoder, and you should still keep a lexical index. Encoders compress rare strings. A dedicated term index matches them directly. Stuffing keywords into the embed text is a patch. Hybrid retrieval is the actual mechanism.",
          ],
          [
            "Is Elasticsearch with a kNN field hybrid search?",
            "It can be, if you query both a lexical clause and a kNN clause and combine them deliberately. A product that merely has both features is not hybrid until the query path uses both and you have measured the fusion. The engine is not the strategy.",
          ],
          [
            "What do you watch in production after launch?",
            "Per-query-type recall on a rolling labeled sample, the rate at which the clicked or cited chunk came from only one retriever, empty result rate, and latency of the two searches. If one side never contributes a winner, you are paying for a dead index.",
          ],
        ],
        mistakes: [
          "Adding raw BM25 to cosine and calling it hybrid",
          "Running the two searches under different permission filters",
          "Judging the blend on only one query style, then shipping it for both",
          "Using hybrid search to avoid looking at a broken chunking scheme",
        ],
        conceptual: [
          ["What are the two retrievers in a typical hybrid setup?", "A sparse lexical ranker such as BM25, and a dense embedding ranker."],
          ["Why are the raw scores hard to add?", "They are not on the same scale, so one side dominates."],
          ["What does reciprocal rank fusion use instead of the raw score?", "The position in each ranked list."],
          ["Which side usually wins on an error code?", "The sparse side."],
          ["Which side usually wins on a paraphrase?", "The dense side."],
        ],
        practical: [
          ["Write the contribution of a document at rank 1 with k = 60.", "1 / 61."],
          ["Both lists contain chunk C, at ranks 2 and 5, k = 60. What is C's RRF score?", "1/62 + 1/65."],
          ["You fuse top 5 from each side and the gold chunk is rank 12 on both. What happens?", "Fusion cannot surface it. Widen the windows or fix the retrievers."],
        ],
        advanced: [
          ["Dense recall is fine, hybrid answers got worse. What do you inspect?", "The fused order. A lexical distractor may now outrank the dense hit. Look at RRF's k, the window, and whether you still rerank."],
          ["How do you know BM25 is earning its cost?", "On the eval set, count questions where the cited chunk was missing from the dense list and present after fusion."],
        ],
        refs: [
          { id: "rag-bm25", note: "The sparse half of this page." },
          { id: "rag-rerank", note: "What you run after the lists are fused." },
          { id: "rag-vector-search", note: "The dense half of this page." },
        ],
      }),
      topic({
        id: "rag-bm25",
        name: "BM25",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Explain term frequency, inverse document frequency, and length normalization", "Know when lexical search is the right primary retriever"],
        beginner: "BM25 ranks documents that share distinctive words with the query. A rare word counts more than a word that is in every document. A very long document is not rewarded just for being long.",
        technical: "It is a bag-of-words scorer. Term frequency saturates, so the tenth repetition helps less than the first. Inverse document frequency down-weights common terms. A length normalizer stops long chunks from winning by accumulation. Parameters k1 and b control saturation and length, and the defaults are often fine until you measure.",
        internals: "Tokenization must match between index and query. Splitting error_code differently from error code changes the match. Stemming helps word forms and hurts identifiers. Store the original text separately from the token stream.",
        flow: "Tokenize query, look up postings, score chunks with the same metadata filter as vector search, return a ranked window for fusion.",
        useCases: ["Error strings, function names, clause numbers, exact product names"],
        terms: [
          ["TF", "How often the term appears, with diminishing returns."],
          ["IDF", "How rare the term is across the corpus. Rare terms matter more."],
          ["k1 and b", "Saturation and length-normalization knobs."],
        ],
        limits: ["No shared terms means no score, even if the meaning matches."],
        alternatives: ["Learned sparse models such as SPLADE, if you need lexical expansion"],
        practice: ["Tokenize an error code and a sentence two ways and show which one BM25 can match."],
        fundamental: [
          ["Why does IDF matter?", "A match on 'the' is evidence of nothing. A match on a rare code is evidence. IDF encodes that."],
          ["Why normalize length?", "Otherwise a long chunk wins by containing more words, not by being more relevant."],
        ],
        intermediate: [
          ["What tokenization bug breaks code search?", "Splitting snake_case or stripping digits so the identifier in the query is not the identifier in the index."],
        ],
        scenario: [
          ["BM25 returns the glossary because every term appears there. What is wrong?", "The glossary is a long, term-rich distractor. Length normalization, a field boost on the title, or down-ranking that source type will help. So will a reranker."],
        ],
        followUp: [
          ["Is BM25 obsolete now that embeddings exist?", "No. Exact rare tokens are still a lexical problem. Embeddings complement BM25. They do not replace the postings list."],
        ],
        mistakes: ["Stemming identifiers", "Different analyzers at index time and query time", "Expecting BM25 to understand synonyms it has never been told"],
        conceptual: [
          ["What does IDF reward?", "Rare terms."],
          ["What does length normalization prevent?", "Long documents winning just by being long."],
          ["What query will BM25 score as zero overlap?", "A paraphrase that shares no indexed terms."],
        ],
        practical: [
          ["Query and document tokenize 'ERR-21' differently. What do you fix?", "One analyzer for both index and query."],
        ],
        advanced: [
          ["Would you stem a legal corpus?", "Only after you check that stemming does not merge distinct terms of art. Measure, do not enable it by habit."],
        ],
        refs: [{ id: "rag-hybrid", note: "BM25 is usually fused with dense retrieval, not used as the whole system." }],
      }),
      topic({
        id: "rag-rewrite",
        name: "Query rewriting",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Rewrite a conversational question into a standalone search query", "Avoid rewriting when the raw query is already an exact key"],
        beginner: "People ask follow-ups like 'what about Europe?' The retriever was not in the conversation. Rewriting turns that into a standalone query such as 'EU refund window for annual plans'.",
        technical: "A small model or a deterministic rule uses chat history to resolve pronouns and ellipsis. The rewritten string is what you embed and send to BM25. Keep the original too. Over-rewriting an error code into a paragraph can destroy the lexical match.",
        internals: "Log original, rewrite, and retrieved ids. If rewrite recall is worse than the raw query on your set, skip the rewriter for that query class.",
        flow: "Classify the query, rewrite only if it depends on history or is vague, search with the rewrite, and fall back to the raw query when the rewrite is longer and less specific.",
        useCases: ["Multi-turn support chats", "Search bars where the second question says 'and the price?'"],
        terms: [
          ["Standalone query", "A question that makes sense with no prior turn."],
          ["Ellipsis", "The user omitted words that were in the previous turn."],
        ],
        limits: ["The rewriter can invent a constraint the user did not ask for and search the wrong facet."],
        practice: ["Rewrite three follow-up questions. Mark one that you would not rewrite because it is an exact code."],
        fundamental: [
          ["Why rewrite at all?", "The retriever does not read the chat. An unresolved pronoun has nothing to match."],
        ],
        mistakes: ["Always rewriting, including pasted stack traces", "Not storing the original query, so you cannot undo a bad rewriter"],
        conceptual: [
          ["What is a standalone query?", "One that does not depend on earlier turns."],
          ["When do you skip rewriting?", "When the user message is already a specific key or a complete question."],
        ],
        practical: [
          ["'What about enterprise?' retrieved home-page marketing. What context was missing?", "The prior topic, such as SSO pricing, was not folded into the query."],
        ],
        advanced: [
          ["How do you eval a rewriter?", "Compare retrieval recall with and without it on multi-turn items, not on single-turn keyword searches."],
        ],
      }),
      topic({
        id: "rag-multiquery",
        name: "Multi-query retrieval",
        priority: "P2",
        tracks: [...ai],
        objectives: ["Generate a few query variants and merge their hits", "Know the cost and the failure mode"],
        beginner: "One wording misses. Several wordings, searched and merged, often catch the passage.",
        technical: "You generate two to five variants, search each, and fuse the lists the same way hybrid search fuses dense and sparse. Variants should differ in vocabulary, not just punctuation.",
        internals: "This multiplies search cost. Cap variants. Deduplicate chunk ids before reranking. A variant that adds a wrong entity will pull a confident distractor into the pool.",
        flow: "Generate variants, search each under the same filter, fuse by rank, rerank the unique set.",
        useCases: ["Short, ambiguous questions with several plausible phrasings"],
        terms: [
          ["Query variant", "Another wording of the same information need."],
          ["Fusion", "Merging several ranked lists into one."],
        ],
        limits: ["Variants that change the meaning hurt more than they help."],
        practice: ["Write one question and three variants. Cross out any variant that changes the entity or the constraint."],
        fundamental: [
          ["How is multi-query different from hybrid search?", "Hybrid mixes retriever types for one query. Multi-query mixes several wordings, often through the same retrievers."],
        ],
        mistakes: ["Generating ten paraphrases that all say the same thing", "Allowing the model to add facts that were not in the question"],
        conceptual: [
          ["What do you merge?", "The ranked lists from each variant."],
          ["What is the main cost?", "Extra searches, and extra wrong candidates if a variant drifts."],
        ],
        practical: [
          ["All variants return the same wrong doc. Where do you look?", "The corpus or the chunker. Wording was not the bug."],
        ],
        advanced: [
          ["When would you prefer hypothetical-document expansion over multi-query?", "When the gap is that questions and passages live in different styles, and a fake answer passage matches the index better than another question."],
        ],
      }),
      topic({
        id: "rag-rerank",
        name: "Reranking",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Explain bi-encoder versus cross-encoder", "Place reranking after candidate generation"],
        beginner: "The first search is fast and a bit rough. A reranker reads the query and each candidate together and puts the truly relevant ones on top.",
        technical: "A cross-encoder scores the pair jointly, so it can see interactions a dot product cannot. It is too expensive to run on the whole corpus. You rerank a window of 20 to 100 fused candidates and then keep the best few for the prompt.",
        internals: "Latency is roughly linear in the window. Batch the pairs. Cache nothing across users unless the query text is identical and the permissions match. A reranker trained on web search may not understand your clause numbers. Evaluate on your labels.",
        flow: "Retrieve a wide window, score pairs, sort, cut to the token budget, and log both orders so you can see what the reranker changed.",
        useCases: ["The right chunk is in the top 30 and not in the top 3"],
        terms: [
          ["Cross-encoder", "A model that scores one query-passage pair at a time."],
          ["Candidate window", "The shortlist the first-stage retrievers produced."],
        ],
        performance: ["This is often the latency knob. Shrink the window before you shrink the generator."],
        limits: ["A reranker cannot find a chunk the first stage never returned."],
        tradeoffs: ["Better precision at the top, more latency and a second model to operate."],
        practice: ["Describe a case where rank 1 from vector search is a distractor and a cross-encoder would demote it. Say what interaction it sees."],
        fundamental: [
          ["Why not cross-encode the whole corpus?", "Every document would be a full model pass. ANN or BM25 exists to avoid that."],
          ["What does a reranker need from the first stage?", "A window that already contains the relevant chunk."],
        ],
        intermediate: [
          ["Your reranker helps the eval set and slows production past the SLO. What do you change first?", "The window size and whether you rerank every query. Some query classes can skip it."],
        ],
        scenario: [
          ["Top 20 recall is high, top 3 precision is poor, answers are distracted. What component is missing?", "A reranker, or a better one. The generator is reading distractors that search already retrieved."],
        ],
        followUp: [
          ["Is the reranker allowed to see metadata the user should not?", "No. Forbidden passages should never enter the window. Reranking is not a permission boundary."],
        ],
        mistakes: ["Reranking three chunks and expecting a miracle", "Judging the reranker when the gold chunk was not in the window"],
        conceptual: [
          ["What is a cross-encoder?", "A model that scores a query and a passage together."],
          ["Where does it sit in the pipeline?", "After candidate retrieval, before the prompt is built."],
          ["What can it not do?", "Retrieve a chunk the first stage missed."],
        ],
        practical: [
          ["Latency doubled after reranking. Name the knob.", "How many candidates you score."],
        ],
        advanced: [
          ["When would a listwise LLM reranker be worth it?", "When pairwise cross-encoders miss domain nuance and the window is small enough to pay for a stronger reader."],
        ],
      }),
      topic({
        id: "rag-compress",
        name: "Context compression",
        priority: "P2",
        tracks: [...ai],
        objectives: ["Shrink retrieved text without dropping the fact", "Know when compression hides the evidence"],
        beginner: "You do not have to paste the whole chunk into the prompt. Compression keeps the sentences that matter and drops the rest, which saves tokens and reduces distraction.",
        technical: "Extractive compression selects sentences. Abstractive compression summarizes, which can distort a number or a negation. For policies and prices, prefer extractive spans you can still cite.",
        internals: "Run compression per chunk, not once over a pile, or the summary will blend sources. Keep the raw chunk id on every span you keep.",
        flow: "Retrieve, select spans, budget tokens, generate from spans, cite the parent chunk.",
        useCases: ["Long chunks where one sentence answers the question"],
        terms: [
          ["Extractive", "A substring of the source."],
          ["Abstractive", "A paraphrase, which can change the fact."],
        ],
        limits: ["A summary can drop 'not' or a condition. That is worse than a long prompt."],
        practice: ["Take a paragraph with an exception and mark the spans you must keep."],
        fundamental: [
          ["Why compress?", "To spend the context window on evidence instead of boilerplate the retriever happened to include."],
        ],
        mistakes: ["Summarizing away the number you needed", "Losing the citation when you compress"],
        conceptual: [
          ["Which form preserves a legal condition better?", "Extractive spans."],
          ["What must you still store?", "The source chunk id."],
        ],
        practical: [
          ["The answer missed the phrase 'unless the invoice is unpaid'. What did compression do?", "It dropped the condition. Keep that sentence or stop compressing this doc type."],
        ],
        advanced: [
          ["When do you skip compression?", "When chunks are already tight and the failure mode is missing text, not extra text."],
        ],
      }),
    ],
  },
  {
    id: "rag-advanced",
    name: "Advanced RAG",
    topics: [
      topic({
        id: "rag-advanced-patterns",
        name: "Advanced RAG patterns",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Name the patterns that sit around vanilla retrieve-then-read", "Choose one only when a measured failure requires it"],
        beginner: "Advanced RAG is a menu, not a stack you turn on. Each pattern fixes one failure: bad queries, bad context, or answers that need several hops.",
        technical: "Corrective RAG checks whether the retrieved set is relevant and rewrites or abstains. Self-RAG critiques drafts. Query decomposition splits a compound question. These add model calls. Ship one when the eval shows that failure, not because a diagram had more boxes.",
        internals: "Every extra call is latency, cost, and a new way to drift. Log the branch taken so you can see that the fancy path actually runs.",
        flow: "Measure a failure mode, add the smallest pattern that targets it, compare against vanilla RAG on the same labeled set.",
        useCases: ["Compound questions that need two documents", "A relevance check before you pay for a long answer"],
        terms: [
          ["Corrective RAG", "Judge the retrieved set and retrieve again or abstain."],
          ["Decomposition", "Split one question into sub-questions, retrieve for each, then synthesize."],
        ],
        limits: ["A pipeline of five LLM calls is not advanced if recall did not move."],
        practice: ["Pick one failure from your notes and name the single pattern that matches it."],
        fundamental: [
          ["Why not enable every RAG pattern?", "Each one costs a model call and can introduce a new error. You add a pattern to fix a measured miss."],
        ],
        mistakes: ["Stacking patterns with no baseline", "Calling a bigger graph 'advanced' when chunking is still broken"],
        conceptual: [
          ["What does corrective RAG decide?", "Whether the current passages are good enough to answer."],
          ["What does decomposition help?", "Questions that are really two questions."],
        ],
        practical: [
          ["Half your errors are 'not in context'. Which pattern is irrelevant?", "A generator-side critique. The passage was never there."],
        ],
        advanced: [
          ["How do you justify a second retrieval hop?", "Show that hop two recovers gold passages hop one missed, on a labeled slice, within the latency budget."],
        ],
      }),
      topic({
        id: "rag-graph",
        name: "Graph RAG",
        priority: "P2",
        tracks: [...ai],
        objectives: ["Explain when a graph of entities helps", "Contrast it with chunk retrieval"],
        beginner: "Graph RAG extracts entities and relationships, then searches that graph. It helps questions about connections across many documents, not questions answered by one paragraph.",
        technical: "You build entities and edges, sometimes community summaries, and retrieve a subgraph or a summary. Construction is expensive and brittle. If the question is 'what is the refund window', a chunk retriever is the right tool and a graph is overhead.",
        internals: "Extraction errors become permanent edges. You need a way to rebuild the graph when documents change. Multi-hop questions are the eval set that justifies the cost.",
        flow: "Extract entities, store edges with source chunk ids, retrieve an entity neighborhood or a community summary, cite the underlying chunks.",
        useCases: ["Who is connected to whom across a corpus of reports", "Questions that no single chunk contains"],
        terms: [
          ["Entity", "A thing you would put in a node: a person, service, or clause."],
          ["Community summary", "A generated summary of a cluster of related nodes."],
        ],
        limits: ["Local factual lookup is slower and worse if you force it through a graph."],
        practice: ["Write one question a graph can answer that one chunk cannot, and one question where a graph is wasted."],
        fundamental: [
          ["When is Graph RAG worth it?", "When the answer is a relationship spread across documents, and you have measured that chunk RAG fails those items."],
        ],
        mistakes: ["Building a graph for a FAQ", "Trusting extracted edges with no source span"],
        conceptual: [
          ["What does the graph store that chunks do not?", "Explicit links between entities across passages."],
          ["What should an edge point back to?", "The source chunk, so the link can be checked."],
        ],
        practical: [
          ["A relationship in the answer has no supporting chunk. What do you stop trusting?", "The extracted edge. Do not show it as a fact."],
        ],
        advanced: [
          ["How do you update the graph?", "Incrementally for changed documents, with a full rebuild when the extractor changes."],
        ],
      }),
      topic({
        id: "rag-agentic",
        name: "Agentic RAG",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Separate a fixed pipeline from a retriever the agent calls as a tool", "Bound the loop"],
        beginner: "Agentic RAG lets a model decide to search, read, and search again. A normal RAG pipeline searches once on a fixed schedule.",
        technical: "The retriever is a tool with a schema: query, filters, k. The agent may call it several times. You cap calls, require citations, and keep the same permission filter inside the tool. An agent that can search anything the user cannot see is a data leak with extra steps.",
        internals: "Loops need a stop condition: enough evidence, or a max number of tool calls. Log every call and the chunk ids. Without a cap, a confused agent spends the budget on repeated searches.",
        flow: "Model writes a tool call, the server retrieves under the user ACL, the observation returns, the model either answers or calls again, until the cap.",
        useCases: ["Research questions that need a second query after reading the first result"],
        terms: [
          ["Tool", "A function the model may call. Retrieval is one tool."],
          ["Stop condition", "The rule that ends the loop."],
        ],
        limits: ["Many product questions are one hop. An agent loop makes them slower and less predictable."],
        practice: ["Define the tool schema and the maximum number of searches for a support bot."],
        fundamental: [
          ["How is agentic RAG different from a pipeline?", "The model chooses whether and how to search. A pipeline always runs the same steps."],
        ],
        mistakes: ["Unbounded tool loops", "A retrieval tool with broader permissions than the user"],
        conceptual: [
          ["What is the retriever in an agent system?", "A tool with arguments and an access check."],
          ["Why cap the calls?", "Cost, latency, and runaway loops."],
        ],
        practical: [
          ["The agent searches five times and still abstains. Is that a failure?", "Not always. It may be the honest outcome. Check that the cap was hit for a reason you logged."],
        ],
        advanced: [
          ["When do you keep a fixed pipeline instead?", "When the questions are single-hop and you need a stable latency SLO."],
        ],
        refs: [{ id: "agent-tools", note: "Tool calling as an engineering interface." }],
      }),
      topic({
        id: "rag-multimodal",
        name: "Multimodal RAG",
        priority: "P2",
        tracks: [...ai],
        objectives: ["Retrieve images, tables, and figures, not only paragraphs", "Keep a text fallback"],
        beginner: "Some answers live in a chart or a screenshot. Multimodal RAG embeds those too, or extracts text from them and searches that text.",
        technical: "You can OCR or caption an image and put the caption in the same lexical and vector indexes, or you can embed the image with a multimodal model. Captions are easier to cite and debug. Native image vectors help when the visual layout is the signal, such as a UI screenshot.",
        internals: "Store the media pointer, the caption, and the page. The generator needs either the caption or a model that accepts the image. Do not claim the model 'saw' the figure if you only sent a caption.",
        flow: "Extract or caption, index the text and optionally the image vector, retrieve, pass the caption plus the image if the generator accepts it.",
        useCases: ["Manuals where the step is a diagram", "Slides"],
        terms: [
          ["Caption", "Text describing an image, which you can index with ordinary search."],
          ["Multimodal embedding", "A vector space shared by images and text."],
        ],
        limits: ["A bad caption makes a confident wrong index entry. OCR still fails on decorative text."],
        practice: ["For a chart, write the caption you would index so a question about the trend can match."],
        fundamental: [
          ["What is the simplest multimodal path?", "Extract or caption, then use the text indexes you already trust."],
        ],
        mistakes: ["Dropping figures entirely", "Sending only a caption while telling the user the model inspected the image"],
        conceptual: [
          ["What do you store with a figure?", "A pointer, a caption or OCR text, and the page."],
          ["When is a native image embedding worth it?", "When layout or pixels matter more than the words around them."],
        ],
        practical: [
          ["The diagram text never matches queries. What failed?", "OCR or captioning. The retriever never saw the words."],
        ],
        advanced: [
          ["How do you cite a chart?", "Page and figure id, plus the caption span you actually used."],
        ],
      }),
    ],
  },
  {
    id: "rag-production",
    name: "Evaluation and production",
    topics: [
      topic({
        id: "rag-eval",
        name: "Retrieval evaluation",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Separate retrieval metrics from answer metrics", "Build a small labeled set you will actually maintain"],
        beginner: "If you only read the final answer, you cannot tell whether search failed or the model failed. Evaluate retrieval on its own.",
        technical: "Label queries with the chunk ids that contain the answer. Report recall@k and MRR for the retriever, then faithfulness and correctness for the generator. A change to the chunker invalidates chunk ids, so plan to relabel or use span-level labels.",
        internals: "Slice the set: exact codes, paraphrases, multi-hop, and questions with no answer in the corpus. An average score hides a broken slice. Include abstention items so the system is punished for inventing.",
        flow: "Freeze a golden set, run the retrieval stack, compute recall of gold ids in the window, then run generation only on the retrieval output you logged.",
        useCases: ["Deciding whether a new embedding model is an improvement", "Stopping a chunker change that drops recall"],
        terms: [
          ["Recall@k", "How often a gold chunk appears in the top k."],
          ["MRR", "Mean reciprocal rank of the first gold chunk."],
          ["Gold chunk", "A passage a human said contains the answer."],
        ],
        limits: ["Twenty happy-path questions will lie to you. You still start there rather than with no set."],
        practice: ["Define recall@10 for hybrid search in one sentence, and name the id list you compute it on."],
        fundamental: [
          ["Why split retrieval eval from answer eval?", "They fail differently and you fix different components. A blended score tells you nothing about which knob to turn."],
          ["What do you label?", "Queries paired with the chunks that are sufficient to answer, plus queries that should abstain."],
        ],
        mistakes: ["Judging a retriever by whether the prose 'sounds good'", "A test set made only of questions you already know succeed"],
        conceptual: [
          ["What is recall@k?", "The fraction of questions whose gold chunk is in the top k."],
          ["What is a gold chunk?", "A labeled passage that contains the answer."],
          ["Why include unanswerable questions?", "To test abstention, not just retrieval."],
        ],
        practical: [
          ["Answer quality fell, recall@10 did not. Where do you look?", "Reranking, prompt, or the generator. Search still found the passage."],
        ],
        advanced: [
          ["Chunk ids changed after a reindex. How do you keep the eval alive?", "Label source spans or stable anchors, and map them to chunks at eval time."],
        ],
        refs: [{ id: "llm-eval", note: "Faithfulness and answer metrics live with LLM evaluation." }],
      }),
      topic({
        id: "rag-obs",
        name: "RAG observability",
        priority: "P1",
        tracks: [...ai],
        objectives: ["Log the trace of one answer", "Debug from the trace without reproducing by luck"],
        beginner: "Observability for RAG is a trace: what was asked, what was searched, what came back, what the model saw, and what it said.",
        technical: "Capture query, rewrite, filter, both ranked lists, fused list, reranked list, prompt token count, model id, answer, citations, latency per stage, and whether the user retried. Redact secrets. You cannot eval or debug a system you did not trace.",
        internals: "Traces are per request and must carry the tenant id for access, while dashboards aggregate without storing more raw text than you need. Sample full prompts if storage is expensive, but keep chunk ids for every request.",
        flow: "One structured log or span per stage, joined by request id. A bad answer should be reconstructable from that id.",
        useCases: ["A customer says the bot is wrong and you have five minutes to see why"],
        terms: [
          ["Trace", "The ordered stages of a single request."],
          ["Request id", "The key that ties those stages together."],
        ],
        limits: ["Logs full of raw customer documents are a new data store you must secure."],
        practice: ["List the fields you need to decide whether a bad answer was retrieval or generation."],
        fundamental: [
          ["What is the minimum trace?", "Query, retrieved ids, the context actually sent, the answer, and the model name."],
        ],
        mistakes: ["Logging only the final answer", "No request id, so stages cannot be joined"],
        conceptual: [
          ["Why log both ranked lists in hybrid search?", "So you can see which retriever found or lost the chunk."],
          ["What do you redact?", "Secrets, tokens, and data the debugger does not need."],
        ],
        practical: [
          ["The cited chunk does not contain the claim. Which stages do you open?", "The prompt context and the generator output. Retrieval may have been fine."],
        ],
        advanced: [
          ["How do traces become an eval set?", "Sample them, label gold chunks and faithfulness, and add the misses back into the golden set."],
        ],
      }),
      topic({
        id: "rag-prod",
        name: "Production RAG architecture",
        priority: "P0",
        tracks: [...ai],
        objectives: ["Draw a deployable architecture", "Name the operational pieces: tenancy, updates, fallbacks, and cost"],
        beginner: "A production RAG system is a search service plus a reader, with queues, permissions, and a way to update documents without downtime.",
        technical: "Put ingestion on a queue. Put search behind an API that applies ACLs. Keep the object store, the relational metadata, and the vector index consistent enough that a deleted document disappears from answers. Generation is a separate call with timeouts, token budgets, and a fallback abstain path.",
        internals: "Version the embedding model and the chunker in the index name or metadata. A new model means a new collection and a backfill, not an in-place mix. Serve the old index until the new one is warmed. Cache embeddings for repeated queries if privacy allows.",
        flow: "Client, auth, query service, retrievers, optional reranker, prompt builder, model gateway, trace store. Ingestion is a side door through a queue into the same indexes.",
        useCases: ["The system you would draw for an international startup that wants a docs assistant"],
        terms: [
          ["Backfill", "Re-embedding an existing corpus into a new index."],
          ["Abstain path", "A controlled refusal when retrieval is empty or low quality."],
          ["Model gateway", "The one place that holds keys, timeouts, and model routing."],
        ],
        performance: ["Budget latency by stage. Protect generation with a timeout. Do not let embedding retries pile onto a user request."],
        limits: ["Consistency between a deleted file and a stale vector is a real bug, not a theoretical one."],
        tradeoffs: ["One Postgres with pgvector is simpler to operate. A split search cluster scales query rate independently and adds a sync problem."],
        practice: [
          "Draw the boxes for ingest, search, and generate. Mark the queue, the ACL check, and the trace.",
          "Write what happens when a document is deleted.",
        ],
        fundamental: [
          ["What happens on document delete?", "Remove or tombstone the chunks in every index the retriever reads, or the deleted text will keep being retrieved."],
          ["Why version the index with the embedding model?", "Vectors from different models are not comparable. A mixed index silently returns nonsense neighbors."],
          ["Where do you enforce permissions?", "In the retrieval API, on every search, before text is sent to a model."],
        ],
        intermediate: [
          ["How do you roll out a new embedding model?", "Build a new collection, backfill, evaluate recall, then switch the query path. Keep the old collection until the new one is proven."],
          ["What do you put on the request path versus the queue?", "Query embedding, search, and generation are on the request. Parsing and corpus embedding are on the queue."],
        ],
        scenario: [
          ["The corpus doubled and p95 latency broke the SLO. How do you think?", "Split the time by stage. If search grew, narrow the ANN or scale the index. If generation grew, cut retrieved tokens. If ingestion is on the request path, get it off. Do not guess from the total."],
        ],
        followUp: [
          ["The interviewer asks what you would not build on day one.", "A graph index, a multi-agent loop, and a custom embedding model. Day one is chunking, hybrid retrieval, ACLs, traces, and a small eval set."],
        ],
        mistakes: [
          "Embedding inside the user request for every uploaded file",
          "No delete path",
          "One global index for every tenant",
          "Switching embedding models in place",
        ],
        conceptual: [
          ["Which path is queued?", "Ingestion and corpus embedding."],
          ["Which path is synchronous?", "Query, retrieve, generate."],
          ["Why a model gateway?", "Keys, timeouts, and routing live in one place."],
          ["What is a backfill?", "Rebuilding vectors for documents already stored."],
          ["Where is the ACL check?", "Inside retrieval, before the model call."],
        ],
        practical: [
          ["Deletes succeed in the app and old text still appears in answers. What is stale?", "The vector or lexical index."],
          ["You need to change chunk size. What else changes?", "Chunk ids, embeddings, and eval mappings."],
          ["Name a safe fallback when search returns nothing.", "Abstain and say the corpus does not contain it. Do not call the model with an empty context and hope."],
        ],
        advanced: [
          ["How do you test tenancy in this architecture?", "Two tenants, overlapping queries, assert chunk ids and traces never cross. Include a delete test."],
          ["What consistency do you accept between object storage and the index?", "Search must not return a chunk whose document is deleted. A short delay on new uploads is usually acceptable if it is visible."],
        ],
        refs: [
          { id: "sd-rag", note: "The system-design practice prompt for this architecture." },
          { id: "rag-hybrid", note: "The retrieval strategy inside the query service." },
        ],
      }),
    ],
  },
];

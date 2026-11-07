import type { Module } from "@/lib/types";
import { topic } from "@/lib/syllabus/build";

const both = ["ai", "swe", "common"] as const;

const intro =
  "I'm Vansh Ahuja. I'm an AI engineer and a full-stack developer. I finished a B.Tech in Computer Science at Graphic Era Hill University in 2025. I interned at Digital2Days, then spent a year as a remote software developer at One Aim IT Solutions, building the Postgres schema and the Node APIs for an employee portal. Since February 2026 I have been an AI engineer at Monkstack. The work I want to go deep on is a blueprint-to-3D pipeline that cut model calls by 70 percent and a drawing from six minutes to ninety seconds, a multi-tenant FastAPI service on AWS, and a shopping assistant that searches 5,000 product variants with pgvector and MCP. I am looking for an AI engineer role where I keep owning retrieval, tools, and the service around them.";

export const aboutModules: Module[] = [
  {
    id: "me-intro-mod",
    name: "Introduction",
    topics: [
      topic({
        id: "me-intro",
        name: "Your introduction",
        priority: "P0",
        tracks: [...both],
        objectives: ["Say the short version without notes", "Stretch it only when they ask for a project"],
        beginner: intro,
        technical:
          "If they give you two minutes, keep the same spine and add one proof. At Monkstack you parse AutoCAD PDFs with deterministic Python first, and you call Claude Sonnet 4 on AWS Bedrock only on tiled crops, then trace a wall graph into polygons. That is why the calls dropped by 70 percent, the drawing went from six minutes to ninety seconds, and the cost stayed under fifty cents. Beside that, the shopping assistant turns catalog variants into text, embeds them with Azure OpenAI into pgvector, and lets GPT-4.1 call search tools over MCP, including colour and size filters and checkout in the chat. Stop there. Let them pick the thread.",
        internals:
          "Do not open with adjectives. Do not list every project. The introduction is a map: who you are, the last two roles, one result, what you want next. Education is one clause, not a paragraph, unless they are a campus recruiter.",
        flow: "Name and role, Last two jobs, One result with a number, What you want next, Stop",
        useCases: ["The first minute of every screen", "A recruiter who says tell me about yourself"],
        terms: [
          ["Spine", "The four beats you always say, in this order."],
          ["Proof", "One number you can defend if they interrupt you."],
        ],
        practice: ["Read the short version out loud once. If you add a sentence, cut one."],
        fundamental: [
          ["What do you say if they interrupt at thirty seconds?", "You already named the role, Monkstack, and the blueprint result. Ask which of those they want."],
          ["Where do the other projects go?", "After they pick. GatherrGo, Qruzine, and the medical notes are not in the opening."],
        ],
        mistakes: ["Reciting the whole portfolio", "A number you cannot explain how you measured"],
        conceptual: [["Why mention One Aim at all?", "It is the year of backend you did before the AI title. They will ask about APIs and Postgres."]],
        practical: [["They say we are a backend team, not an AI lab. What changes?", "Lead with One Aim and GatherrGo, then one sentence on the FastAPI multi-tenant service. Keep the model work as the recent chapter, not the whole story."]],
        advanced: [["What do you want next, in one sentence?", "An AI engineer seat where retrieval, tool use, and the service around them are the job, not a slide."]],
      }),
    ],
  },
  {
    id: "me-exp-mod",
    name: "Explain your experience",
    topics: [
      topic({
        id: "me-monkstack",
        name: "Monkstack — AI engineer",
        priority: "P0",
        tracks: [...both],
        objectives: ["Explain the role in four sentences", "Point them at the two systems you can draw"],
        beginner:
          "Since February 2026 you have been an AI engineer at Monkstack Solutions. Say that you work on applied systems: a drawing pipeline that uses a model only where rules are not enough, a multi-tenant FastAPI backend, and a shopping assistant over a real catalog.",
        technical:
          "Three pieces, in the order you can defend. First, blueprint to 3D: deterministic Python parses AutoCAD PDF vectors, Claude Sonnet 4 on AWS Bedrock runs on tiled crops, and wall-graph polygon tracing finishes the geometry. You measured 70 percent fewer model calls, six minutes down to ninety seconds, and under fifty cents a drawing. Second, the backend: FastAPI in Docker on EC2, Postgres row-level security so a tenant cannot read another tenant, jobs you can cancel, progress over Redis Streams and server-sent events, and each stage saved in S3 so you can replay a failure. Third, the shopping assistant on Azure Container Apps: descriptions of variants, Azure OpenAI embeddings in pgvector, GPT-4.1 tool calls through MCP, filters for colour and size, checkout in the chat, across 5,000-plus variants.",
        internals:
          "If you did not personally own a number, say how it was measured before you quote it. Row-level security means the database enforces the tenant, not only the API. SSE is the browser holding a response open. Redis Streams is the log of stage events the API reads.",
        flow: "Title and dates, The drawing pipeline, The multi-tenant API, The shopping assistant, Offer to draw one",
        useCases: ["Walk me through your current role", "Why should we believe the AI title"],
        terms: [
          ["RLS", "Postgres row-level security. The row knows its tenant."],
          ["SSE", "Server-sent events. One-way progress to the browser."],
          ["Bedrock", "AWS API for the Claude call. You are not hosting the weights."],
        ],
        practice: ["Explain the three pieces in under a minute, then stop and ask which one they want."],
        fundamental: [
          ["What is your current title and since when?", "AI engineer at Monkstack Solutions, from February 2026."],
          ["Why not send the whole drawing to the model?", "Most of the geometry is already in the PDF vectors. The model is for the crops where a rule is unsure. That is the 70 percent."],
        ],
        intermediate: [
          ["How does a tenant stay isolated?", "The API sets the tenant, and Postgres row-level security refuses rows that are not that tenant. A missed WHERE clause is not the only lock."],
          ["Why S3 for stage artifacts?", "A long job fails in the middle. You keep the output of each stage so you can replay from the last good one instead of rerunning the model."],
        ],
        scenario: [["The drawing is still wrong. Where do you look first?", "The vector parse, then the crop the model saw, then the wall graph. You do not start by changing the prompt."]],
        mistakes: ["Saying we use AI for the whole product", "Quoting 70 percent without the before and after"],
        conceptual: [["What is a cancellable job?", "The client can stop it, the worker notices, and you do not keep spending model calls."]],
        practical: [["What would you draw on a whiteboard?", "PDF to vectors, tiles to the model, graph to polygons. Or request to FastAPI, tenant, job, Redis stream, S3."]],
        advanced: [["Which bullet is the AI engineer proof?", "The drawing pipeline and the shopping assistant. The FastAPI service is how you productionize them."]],
        refs: [
          { id: "me-blueprint", note: "The drawing pipeline, question by question." },
          { id: "me-shop", note: "The catalog assistant." },
        ],
      }),
      topic({
        id: "me-oneaim",
        name: "One Aim — software developer",
        priority: "P1",
        tracks: [...both],
        objectives: ["Explain a year of backend without inflating it", "Talk schema, JWT, and roles"],
        beginner:
          "From March 2025 to February 2026 you were a remote software developer at One Aim IT Solutions. The work you describe is an employee management portal: records, payroll, and leave.",
        technical:
          "You designed the Postgres schema and the indexes, and you kept updates in transactions so a payroll write does not half-apply. You built the Node REST API with JWT auth and three roles: admin, manager, and employee. Validation, pagination, and connection pooling are the engineering details. Do not claim you owned every screen. You owned the data model and the API.",
        internals:
          "A transaction is the unit that commits or rolls back together. An index is what makes the filtered list cheap. Pooling is reusing database connections instead of opening one per request. JWT says who they are. The role check says what they may do to this employee.",
        flow: "Remote, one year, Portal for records payroll and leave, Schema and transactions, JWT and three roles",
        useCases: ["Tell me about a backend you owned", "A SWE screen that is not about models"],
        terms: [
          ["JWT", "A signed token that says who is calling."],
          ["RBAC", "Admin, manager, and employee may not call the same routes."],
        ],
        practice: ["Say the role boundary out loud: schema and API, not the entire company."],
        fundamental: [["What did you actually build?", "The Postgres schema and the Node APIs for an employee portal, with auth and roles."]],
        intermediate: [["Why a transaction on payroll?", "Money and leave balances cannot commit halfway. One failure rolls the whole update back."]],
        scenario: [["A manager fetches another team's salaries. What failed?", "Authorization. Authentication only proved who they are. The role and the row scope did not."]],
        mistakes: ["We built the whole HR product", "Confusing login with permission"],
        conceptual: [["What is pagination for?", "The employee list is not one response. You return a page and a cursor or an offset."]],
        practical: [["Why an index?", "The query you run on every list, filtered and ordered, should not scan the table."]],
        advanced: [["What would you redo?", "Name one query that was slow and the index you would add. If you do not remember one, say you would start from the slow list endpoint, not invent a story."]],
      }),
      topic({
        id: "me-intern",
        name: "Digital2Days — internship",
        priority: "P2",
        tracks: [...both],
        objectives: ["Keep the internship to three sentences", "Do not dress it up as ownership"],
        beginner:
          "June 2024 to January 2025, software developer intern at Digital2Days. You worked on full-stack apps in React and Node, fixed bugs, and helped wire REST APIs with senior developers.",
        technical:
          "This is an early chapter. Say what you touched and that seniors reviewed it. The point of the story is that you had already shipped in a team before One Aim. Do not invent a system design for it.",
        internals: "If they push, describe one bug you fixed and how you knew it was fixed. If you cannot remember one, say so and move to One Aim.",
        flow: "Dates, React and Node, Bugs and API integration, What you learned, Hand off to One Aim",
        useCases: ["Walk me through your timeline from college"],
        terms: [["Internship", "You contributed. You did not own the architecture."]],
        practice: ["Tell it in twenty seconds."],
        fundamental: [["What should this answer not become?", "A claim that you designed the product."]],
        mistakes: ["Skipping it and leaving a gap", "Spending three minutes here"],
        conceptual: [["Why mention it?", "It is the start of working with other people's code and real APIs."]],
        practical: [["They ask for a bug from that internship.", "Symptom, what you changed, how you checked. If the memory is gone, say that and offer a later bug from One Aim."]],
      }),
    ],
  },
  {
    id: "me-projects-mod",
    name: "Projects and the questions they ask",
    topics: [
      topic({
        id: "me-blueprint",
        name: "Blueprint to 3D",
        priority: "P0",
        tracks: [...both],
        objectives: ["Draw the pipeline", "Defend why the model is not step one"],
        beginner:
          "At Monkstack you turn an AutoCAD PDF into geometry a 3D step can use. Python reads the vectors first. The model sees only tiled crops. A wall graph is traced into polygons.",
        technical:
          "Deterministic parse, then targeted Claude Sonnet 4 on AWS Bedrock, then polygon tracing. The published result is 70 percent fewer LLM calls, six minutes down to ninety seconds, and under fifty cents per drawing. Say the model is for the ambiguous crop, not for reading every line. Bedrock is the API. You are not training Sonnet.",
        internals:
          "A tile is a crop of the sheet. A wall graph is nodes and edges you can walk into closed polygons. If the parse is wrong, a better prompt will not save the polygon. S3 stage artifacts from the backend story are how you would replay one drawing.",
        flow: "PDF, Vector parse, Tile the unsure parts, Bedrock on those crops, Wall graph, Polygons",
        useCases: ["Your strongest AI system design from work"],
        terms: [
          ["Deterministic", "Same PDF, same vectors, no model."],
          ["Tile", "A crop, so the model does not see the whole sheet."],
        ],
        practice: ["Draw the six boxes from memory."],
        fundamental: [
          ["Why parse before the model?", "The lines are already in the file. Paying a model to rediscover them is the six-minute version."],
          ["What model, and where does it run?", "Claude Sonnet 4 through AWS Bedrock, on crops, not on the full sheet."],
        ],
        intermediate: [
          ["Where do the 70 percent and ninety seconds come from?", "Fewer calls because most geometry never hits the model, and the remaining calls are small crops. Quote them only with that mechanism."],
          ["What do you store so a failed drawing can be replayed?", "The artifact of each stage, in S3, so you resume after the last good step."],
        ],
        scenario: [["A wall is missing. Model or parser?", "Look at the vectors first. If the line was never parsed, the model never had it. If the line was parsed and the polygon is open, the graph trace failed."]],
        followUp: [["Would you fine-tune?", "Not from this evidence. The win was calling the model less. Fine-tuning does not fix a bad parse."]],
        mistakes: ["We use AI to read the drawing", "A cost number with no per-drawing meaning"],
        conceptual: [["What is under fifty cents?", "The model spend for one drawing after you stopped sending the whole sheet."]],
        practical: [["How do you cancel a long drawing?", "The job is cancellable. The worker stops before the next model call."]],
        advanced: [["What is the tenant story next to this?", "The pipeline runs inside the multi-tenant FastAPI service. Isolation is row-level security, not a separate model per customer."]],
        refs: [{ id: "me-monkstack", note: "How this sits in the current role." }],
      }),
      topic({
        id: "me-shop",
        name: "AI shopping assistant",
        priority: "P0",
        tracks: [...both],
        objectives: ["Explain RAG over a catalog", "Explain why the model calls a tool"],
        beginner:
          "Built at Monkstack. Shoppers ask in language. The catalog is about 5,000 variants. You do not ask the model to remember products. You retrieve them.",
        technical:
          "Each variant, including colour and size, becomes a short description. Azure OpenAI embeds that text into Postgres with pgvector. GPT-4.1 calls a search tool exposed through MCP. Filters then narrow colour and size. Checkout stays in the chat. The service runs on Azure Container Apps. The path is message, model, MCP tool, pgvector plus filters, products back into the answer.",
        internals:
          "MCP here is how the model reaches the catalog tool. The model does not query SQL itself. Semantic search finds meaning. The colour filter is structured, because an embedding should not be your only size check.",
        flow: "Variant text, Embed, Store in pgvector, Question, Tool call, Filter, Answer or checkout",
        useCases: ["A RAG deep dive from your own work"],
        terms: [
          ["Variant", "One product in one colour and size."],
          ["pgvector", "Postgres storing the embedding next to the row."],
        ],
        practice: ["Say the request path without looking."],
        fundamental: [
          ["Why not keyword search only?", "Shoppers do not type the catalog's words. Meaning match is the point. Filters still handle colour and size."],
          ["Why a tool call?", "The model must not invent a SKU. The tool returns rows from the catalog."],
        ],
        intermediate: [
          ["What is embedded, the raw table or a sentence?", "A natural-language description of the variant, so the embedding sees colour and size in words, and the filter still checks them as fields."],
          ["Where does it run?", "Azure Container Apps. Embeddings are Azure OpenAI. The model that talks is GPT-4.1."],
        ],
        scenario: [["It recommends a red shirt when they asked for blue.", "Check the filter after retrieval. Semantic search can surface a near neighbour. The colour constraint has to be applied, not hoped for."]],
        followUp: [["How is this different from Atomic Player's assistant?", "Shopping retrieves products and can check out. Atomic Player runs read tools and approval-gated actions on a video workspace."]],
        mistakes: ["The model knows the catalog", "Skipping the filter because the embedding mentioned colour"],
        conceptual: [["What is RAG in this project?", "Retrieve catalog rows, then let the model talk about those rows."]],
        practical: [["What would you measure?", "Did the right variant show up, and did the answer stay inside those rows. Not a single blended score."]],
        advanced: [["When would you refuse checkout?", "When the tool returns nothing, or the size filter matches zero rows. Say so in the chat."]],
        refs: [{ id: "rag-hybrid", note: "The general retrieval pattern, if they go past your project." }],
      }),
      topic({
        id: "me-atomic",
        name: "Atomic Player assistant",
        priority: "P0",
        tracks: [...both],
        objectives: ["Separate read tools from actions", "Explain approval and model routing"],
        beginner:
          "Atomic Player is a video analytics and conversion product. You describe the assistant, which is its own microservice: 21 read-only tools and 7 action tools. Actions wait for the user.",
        technical:
          "A registry lists the tools. A harness runs them. Read tools fetch workspace data. Action tools change the workspace and do not run until the user approves. Simple requests go to a smaller model. Harder ones go to a reasoning model. The answer streams. Node, TypeScript, Postgres, Redis, and Azure are the stack on the portfolio. Do not invent a video-processing pipeline you did not publish.",
        internals:
          "Approval is the product decision: the model may propose a write, the user commits it. Routing is cost and quality. Streaming is the socket or HTTP stream of tokens, not a second business logic path.",
        flow: "User text, Route the model, Pick a tool, If it writes then wait for approval, Run it, Stream the result",
        useCases: ["Tell me about a tool-using agent you shipped"],
        terms: [
          ["Read tool", "Fetches data. No side effect."],
          ["Action tool", "Changes state. Gated."],
        ],
        practice: ["Name the 21 and 7 split and what the 7 must not do alone."],
        fundamental: [
          ["Why a separate service?", "The assistant can fail, scale, and be deployed without taking the core product with it."],
          ["Why not one model for every request?", "Most turns are cheap. Reasoning models are for the turns that need them."],
        ],
        intermediate: [["What is the harness?", "The code that validates the tool call, checks approval if it is an action, runs it, and returns a short observation."]],
        scenario: [["The model tries to delete a workspace.", "That is an action tool. It stays pending until the user approves. If the tool is not in the registry, it does not run."]],
        mistakes: ["Twenty-eight tools that all write", "Claiming you built the video analytics core if the published work is the assistant"],
        conceptual: [["What does streaming change?", "The user sees tokens as they arrive. The tool call is still a complete step before you talk about its result."]],
        practical: [["Where does Redis fit, if they ask and you only know the stack list?", "Say it is in the stack you shipped with, and describe the use you actually implemented. Do not guess a queue you did not build."]],
        advanced: [["How is this not the shopping bot?", "Here the tools are workspace reads and approved writes. There the tool is catalog search plus checkout."]],
      }),
      topic({
        id: "me-gatherr",
        name: "GatherrGo backend",
        priority: "P1",
        tracks: [...both],
        objectives: ["Own the sentence: you built the backend", "Draw the AWS path"],
        beginner:
          "GatherrGo is a React Native app for group travel and events. You designed and built the backend, not the mobile UI.",
        technical:
          "REST for auth, trips and groups, bookings, payments, and notifications. Images ship through ECR. Containers run on EC2 behind an Application Load Balancer. CloudFront delivers content. Postgres is on RDS. Compute, delivery, and data are separate so you add instances instead of growing one box.",
        internals:
          "ALB spreads requests. RDS is the managed database, so you are not patching Postgres on the same box as the API. ECR is where the image lives before EC2 pulls it. Say payments only to the depth you implemented. If a provider name is fuzzy, say the API recorded the booking and the payment step, and do not invent Stripe.",
        flow: "App, ALB, EC2 containers, API, RDS, CloudFront for content",
        useCases: ["A system design grounded in your deploy"],
        terms: [
          ["ALB", "The load balancer in front of the instances."],
          ["ECR", "The registry for the Docker image."],
          ["RDS", "Managed Postgres."],
        ],
        practice: ["Draw the path once, from the phone to RDS."],
        fundamental: [
          ["What did you not build?", "The React Native client. You built the API and the deploy around it."],
          ["How does it scale out?", "More instances behind the load balancer. The database stays the shared store."],
        ],
        intermediate: [["Why split CloudFront from the API?", "Content can be cached at the edge. Booking requests still hit the API. They do not have the same scaling problem."]],
        scenario: [["A booking is charged twice.", "Look at retries on the payment call and whether the booking id is idempotent. Say the principle even if you name the exact key from memory."]],
        mistakes: ["I built the whole app including the mobile client", "A cloud service you cannot place on the diagram"],
        conceptual: [["What is horizontal scale here?", "Add a container. Do not resize the only server and hope."]],
        practical: [["Where is the data?", "PostgreSQL on RDS. Not on the EC2 disk."]],
        advanced: [["What would break first?", "The database, if every new instance opens unbounded connections. That is the pooling conversation from One Aim, applied here."]],
      }),
      topic({
        id: "me-medical",
        name: "AI medical notes",
        priority: "P2",
        tracks: [...both],
        objectives: ["Describe a narrow clinical tool", "Know the limit of what you claim"],
        beginner:
          "A tool for doctors. They record a consultation in the app. The OpenAI API writes a summary. The portfolio numbers are 5-plus doctors and 100-plus consultations.",
        technical:
          "React, Node, WebSockets, MongoDB, recordings in S3, summaries from the OpenAI API. WebSockets fit a live recording session. You do not claim diagnosis. You claim a summary of the conversation they recorded.",
        internals:
          "Audio in S3 is sensitive. Say access is locked to that doctor if that is true in the system you touched. If you are unsure of the exact auth, say the recording is private clinical data and you would not describe a control you did not implement.",
        flow: "Record, Store the audio, Send it for a summary, Show the note, Doctor edits",
        useCases: ["An AI project that is not a chatbot over PDFs"],
        terms: [["Summary", "A note from the recording. Not a diagnosis."]],
        practice: ["Say the boundary: documentation, not medical advice."],
        fundamental: [["What does the model do?", "It summarizes the recorded consultation. It does not decide treatment."]],
        mistakes: ["Calling it a diagnostic system", "A user count you cannot stand behind"],
        conceptual: [["Why S3?", "The recording is a file. The summary can live with the visit in Mongo."]],
        practical: [["Why WebSockets?", "The session is live while the doctor records, not a single request and response."]],
        advanced: [["What would you refuse to generate?", "A diagnosis or a prescription. The output is a draft note the doctor owns."]],
      }),
      topic({
        id: "me-qruzine",
        name: "Qruzine",
        priority: "P2",
        tracks: [...both],
        objectives: ["Explain the diner path and the kitchen path", "Keep the scale claim small"],
        beginner:
          "Qruzine is QR ordering for restaurants. A table QR opens the menu. The diner orders and pays. The kitchen sees the order. A dashboard shows today's revenue, menu, QR codes, and status.",
        technical:
          "Next.js, Tailwind, Node, Express, MongoDB, on EC2. The portfolio says 10-plus restaurants and 500-plus customers a day. Use those only if you can say they were live restaurants, not a screenshot. The flow is scan, menu, order, payment, kitchen.",
        internals: "Real time here means the kitchen sees the order as it is placed, not that you built a chat. If the transport was polling, say polling.",
        flow: "QR, Menu, Order, Pay, Kitchen, Dashboard",
        useCases: ["A full-stack story when they are not asking about models"],
        terms: [["QR", "The link to that restaurant's menu."]],
        practice: ["Tell the diner path and the staff path as two users."],
        fundamental: [["Who are the two users?", "The diner on their phone, and the kitchen or owner on the dashboard."]],
        mistakes: ["Enterprise-scale without the actual deploy", "Mixing this up with SHRM"],
        conceptual: [["What is in Mongo?", "Menu, orders, and the restaurant. Say the collections you remember, not a guessed schema."]],
        practical: [["What does the dashboard show?", "Today's revenue and orders, menu items, QR codes, and order status."]],
        advanced: [["What fails at a dinner rush?", "The order write and the kitchen view. That is the path to index and to make sure an order is not lost if the phone refreshes."]],
      }),
      topic({
        id: "me-shrm",
        name: "SHRM",
        priority: "P3",
        tracks: [...both],
        objectives: ["One paragraph, then stop", "Do not confuse it with the One Aim portal"],
        beginner:
          "SHRM is an HR system for hiring, onboarding, and performance. Next.js, Node, Mongo, Tailwind, REST, EC2. The portfolio says two organizations and 200-plus employees.",
        technical:
          "Treat it as a product you can demo, separate from the One Aim employee portal, which was Postgres and payroll. If you cannot draw a difference, say SHRM is the broader HR product and One Aim was the API and schema work you will go deep on.",
        internals: "Hiring, onboarding, and performance are three workflows. Do not merge them into one CRUD story if they ask you to go deep. Pick the one you remember.",
        flow: "What it is, Stack, Who used it, Hand off to One Aim if they want depth",
        useCases: ["A second HR story, only if they ask"],
        terms: [["HRMS", "Hiring, onboarding, and performance in one product."]],
        practice: ["Say how SHRM differs from One Aim in two sentences."],
        fundamental: [["How is this not One Aim?", "SHRM is the HR product on Mongo and Next. One Aim is the Postgres schema and the Node API for records, payroll, and leave."]],
        mistakes: ["One blended HR story with both stacks"],
        conceptual: [["When do you bring this up?", "If they ask for another full-stack product. It is not in the introduction."]],
        practical: [["What would you open the demo on?", "The workflow you actually click through. Do not start on the landing page."]],
      }),
    ],
  },
];

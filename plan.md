# High level steps for Style-alyst Chatbot Project

Part 1: Plan
- [x] Enrich this document to plan out each of these parts in detail.
- [x] List out substeps as a checklist to be checked off by the agent.
- [x] Define tests and success criteria for each phase.
- [x] Create an `AGENTS.md` file inside the frontend directory describing the architecture and existing code.
- [x] Ensure the user checks and approves this plan.

Part 2: Scaffolding
- [x] Set up the React 18 frontend application (e.g., using Vite) in the `frontend/` directory.
- [x] Configure Tailwind CSS (or standard CSS) and Framer Motion for animations.
- [x] Write start and stop development scripts in the `scripts/` directory (or package.json).
- [x] Serve a basic 'hello world' page to confirm the React 18 setup runs locally.

Part 3: Add in Frontend Mock PDP
- [x] Create a realistic mock JCPenney Product Detail Page (PDP) for the "ana womens crew neck sleeveless vest".
- [x] Implement responsive layout resembling the actual JCPenney product page context.
- [x] Include dummy product details, images, and standard eCommerce elements to serve as a realistic background.

Part 4: Build Core Chatbot UI Widget
- [x] Develop the floating "Style-alyst" chat button with a pulsing contextual prompt (e.g., "Need styling advice?").
- [x] Build the expanding chat window overlay using glassmorphism (`backdrop-filter: blur`) and subtle drop shadows.
- [x] Implement fluid micro-interactions for opening/closing the chat using Framer Motion.
- [x] Add the basic chat message list and text/image input UI.

Part 5: Data & State Modeling
- [x] Propose and define the JSON data models for Chat Messages.
- [x] Define the JSON schema for "Complete the Look" product recommendations (Top, Bottom, Shoes, Accessory).
- [x] Define the payload structure for image uploads.
- [x] Document the data schema in a `docs/` directory and get user sign-off.

Part 6: Mock Backend / API Services
- [x] Add a lightweight backend (or client-side mock services) to handle chat requests and image uploads.
- [x] Create mock responses for the "Closet Matcher" flow, returning dummy JCPenney product matches.
- [x] Implement robust error handling and loading states (skeleton loaders) on the backend simulation.
- [x] Write unit tests for the mock API routes.

Part 7: Frontend + Mock API Integration
- [x] Connect the Chatbot UI to the mock backend API.
- [x] Implement the user flow: upload a photo -> show skeleton loaders -> receive and display mocked product recommendations.
- [x] Test the integration thoroughly to ensure a smooth, client-rendered experience.

Part 8: AI Connectivity
- [x] Integrate a Vision-LLM (e.g., GPT-4o or Gemini Pro Vision) via OpenRouter or direct SDK in the API routes.
- [x] Add the ability to send a user-uploaded image to the AI for basic color, texture, and silhouette analysis.
- [x] Test connectivity with a simple visual query (e.g., "What color is this item?") to ensure the AI responds correctly.

Part 9: Agentic "Complete the Look" Logic
- [ ] Extend the AI backend call to include the user's uploaded image, user's text query, and the current PDP context.
- [ ] Prompt the AI to act as a high-end boutique personal stylist.
- [ ] Require the AI to return Structured Outputs (JSON) containing the chat response and a curated "Complete the Look" outfit (Top + Bottom + Shoes + Accessory).
- [ ] Test the AI's reasoning, contextual logic (e.g., "summer wedding"), and JSON output format thoroughly.

Part 10: Final UI Polish & Rich Media Integration
- [ ] Update the chatbot UI to parse the LLM's Structured Output.
- [ ] Render the outfit recommendations in beautifully styled, horizontal scrollable carousels.
- [ ] Include high-quality JCPenney product images, clear pricing, and functional "Shop the Look" buttons within the chat.
- [ ] Ensure the AI chat can refresh the widget automatically based on its Structured Outputs, completing the MVP vision.

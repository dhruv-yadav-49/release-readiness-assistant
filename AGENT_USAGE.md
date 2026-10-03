# Agent Usage

This repository was heavily developed in collaboration with an AI coding assistant (Google Antigravity IDE). Below is a summary of the agent's involvement.

## Tools Used
- **Google Antigravity IDE**: Provided contextual, agentic code generation, terminal execution, and debugging across both frontend and backend directories simultaneously.

## Representative Prompts
- *"Build the Release Readiness Assistant backend API based on the Mongoose schema. Implement routes for creating releases, triggering AI generation, and fetching the final brief."*
- *"The horizontal scrollbar is overflowing on the VersionHistory page, fix it. The 'Affected Users' text is going out of the box."*
- *"Implement a retry logic mechanism if the AI generation fails midway, ensuring no corrupt data is left behind."*
- *"Create a beautiful, modern UI for reviewing AI-generated statements with Approve/Reject buttons."*

## Delegated Work
The AI agent was delegated the vast majority of the heavy lifting, including:
- Designing and implementing the MongoDB schemas (`Release`, `GeneratedStatement`).
- Building the Express API endpoints and integrating the Zod validation layer.
- Integrating the `@google/generative-ai` SDK and designing the prompts that convert raw release items into structured stakeholder statements.
- Building the entire React (Vite) frontend, including routing, TailwindCSS styling, Lucide React icons integration, and complex dashboard layouts.
- Implementing the "Compare Versions" diffing logic and the `stale` statement tracking.
- Writing the `e2e.ts` backend testing script.

## Important Agent Mistakes and Rejected Suggestions
- **Layout Shift / CSS Grid Blowouts**: The agent initially used a layout relying on `w-full` and margins for the sidebar, which caused horizontal scrolling bugs on smaller screens when tables were wide. This was rejected, and the agent was instructed to rewrite the root layout using `h-screen overflow-hidden` with proper flex properties. Similarly, the agent forgot to add `min-w-0` to flex and grid children, causing text truncation (`truncate`) to fail and break the boxes. This was identified via screenshots and fixed by the agent iteratively.
- **Stale Marking Logic**: Initially, the agent suggested a simple boolean flip for stale statements. We had to iterate on the logic to ensure that when a new version is created, old statements are copied and *then* selectively marked as stale only if their underlying `qaEvidence` or `description` had changed.
- **Database Connection Issues**: The agent occasionally struggled to troubleshoot MongoDB Atlas connection issues blindly without access to the Atlas dashboard, requiring the human operator to provide screenshots of the IP Whitelists to guide the agent's debugging steps.

## Verification of Output
The agent's output was verified through:
1. **Manual UI Testing**: Clicking through the workflow locally to ensure the user experience was smooth, states updated correctly, and layouts didn't break.
2. **Automated E2E Testing**: Running `npx tsx e2e.ts` to programmatically verify that the database states (like `isStale` and `reviewStatus`) were correctly updated and persisted across API calls.
3. **Visual Inspection**: Providing screenshots of UI bugs back to the agent for targeted fixes.

# Release Readiness Assistant

## Overview
The Release Readiness Assistant is a specialized tool designed to automate the generation of communication briefs for software releases. By combining a modern web interface with Google's Gemini AI, the assistant converts technical release items (features, fixes, behavior changes) into human-readable statements tailored for stakeholders. 

It includes a robust human-in-the-loop review system, version control for tracking changes across releases, and automated generation of a final exportable brief.

## Architecture
This project is built using the **MERN** stack and structured as a monorepo containing a `client` and a `server`:
- **Frontend (`/client`)**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, and Lucide React icons. Features a responsive, modern dashboard layout.
- **Backend (`/server`)**: Node.js, Express, TypeScript, MongoDB (Mongoose), and Zod for schema validation.
- **AI Integration**: Uses `@google/generative-ai` to process release items and generate stakeholder/technical statements.

## Setup Instructions
### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API Key

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your credentials.
4. Start the development server: `npm run dev`

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`.
4. Start the frontend server: `npm run dev`

## Completed Scope
- **Release Creation**: Submit technical items (features, fixes) with QA evidence and user impact.
- **AI Generation**: Asynchronously generate isolated statements for each release item.
- **Review Workflow**: Human-in-the-loop interface to approve, edit, or reject AI-generated statements.
- **Version Control**: Create new versions of a release. Unchanged items inherit previous statements, while modified items mark older statements as `stale`.
- **Fault Tolerance**: Retry mechanism for AI timeouts/failures that safely cleans up partial data.
- **Final Brief Export**: Consolidates approved statements into a structured brief (Technical, Stakeholder, Risks) with PDF and Clipboard export capabilities.

## Excluded Scope
- **Authentication/Authorization**: Real user login is mocked. The "Settings" and "Profile" areas are placeholders.
- **Real-time WebSockets**: AI progress relies on client-side polling rather than WebSocket pushes.
- **Rich Text Editing**: Statement editing uses standard textareas instead of a Markdown/WYSIWYG editor for simplicity.

## Tests
An End-to-End (E2E) API test suite is included in `server/e2e.ts`. It verifies:
- Complete workflow (Creation -> AI Processing -> Approval -> Final Brief).
- Safe failure handling and retry logic.
- Proper propagation of `stale` flags when new versions are created.
- Exclusion of rejected/stale statements from the Final Brief.

Run tests using: `npx tsx e2e.ts` (inside the `server` directory).

## Limitations
- AI processing takes 10-30 seconds depending on the Gemini API response times.
- Extremely large release notes (100+ items) might hit rate limits or context windows in a single AI pass.
- PDF export relies on browser-native print capabilities rather than server-side PDF generation.

## Deployment Details
This application is designed to be hosted on platforms like Render or Vercel.
- **Backend**: Deploy as a Node Web Service. Set root directory to `server`, build command to `npm install && npm run build`, and start command to `npm start`. Ensure `MONGODB_URI` and `GEMINI_API_KEY` are configured.
- **Frontend**: Deploy as a Static Site. Set root directory to `client`, build command to `npm install && npm run build`, and publish directory to `dist`. Set `VITE_API_URL` to point to the deployed backend.

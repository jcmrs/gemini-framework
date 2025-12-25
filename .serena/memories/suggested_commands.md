# Suggested Commands

## Gemini CLI (Aliases)
These commands interact with the Gemini Cortex.
*   `gemini g "Query"`: Standard interaction.
*   `gemini init`: Initialize the session (Boot SRE).
*   `gemini review <scope>`: Start a systematic code review.
*   `gemini brainstorm <topic>`: Start a brainstorming session.
*   `gemini log`: Document the session.

## System Commands (Windows)
*   `sync`: `node gemini/scripts/sync.js` (Synchronize framework).
*   `hydrate`: `echo 'Hydration is now dynamic via Cortex Synapse.'`

## Development
*   **Start Cortex:** `node gemini/cortex/bin/cortex.js`
*   **Start MCP Server:** `node gemini/mcp-server/src/index.js` (or `npm start` in `gemini/mcp-server`)

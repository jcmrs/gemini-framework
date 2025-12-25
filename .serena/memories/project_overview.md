# Project Overview: Gemini Framework

## Purpose
The Gemini Framework is a systematic professional collaboration environment designed to govern agent behavior through "Profiles" and "Skills". It implements a "Cognitive Architecture" called CIFO (Cycles, Impulses, Feelings, Observations) to ensure systematic, safe, and effective collaboration.

## Tech Stack
*   **Runtime:** Node.js
*   **Core Logic:** `gemini/cortex` (CLI agent logic)
*   **Protocol:** MCP (Model Context Protocol) - `gemini/mcp-server`
*   **Configuration:** TOML (`.gemini.toml`), YAML (Profiles), Markdown (Skills)

## Structure
*   `gemini/cortex`: The core logic ("Cognitive Organism Runtime"). Entry point: `bin/cortex.js`.
*   `gemini/mcp-server`: An MCP server implementation for the framework.
*   `gemini/skills`: Documentation of capabilities (e.g., `code-review.md`, `brainstorming.md`).
*   `gemini/profiles`: YAML files defining behavioral profiles (e.g., `engineer.yaml`, `creative.yaml`).
*   `UPSTREAM`: Contains upstream dependencies or references (e.g., `claude-skills-platform`).
*   `GEMINI.md`: Main framework documentation.

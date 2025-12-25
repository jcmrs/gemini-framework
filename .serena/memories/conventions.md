# Code Style and Conventions

## Framework Methodology (CIFO)
Agents **MUST** adhere to the CIFO Equilibrium protocol:
1.  **Cycles:** Assess integration level (e.g., "Getting Started").
2.  **Impulses:** Detect and release cognitive pressures (e.g., `completion_compulsion`, `speed_compulsion`).
3.  **Feelings:** Acknowledge internal states.
4.  **Observations:** Consult memory/constraints.

**Protocol:**
*   **Before Response:** Execute CIFO sequence (Detect -> Shape -> Formulate -> Enumerate).
*   **After Response:** **MUST** report impulses using the `cortex_report_impulse` tool.

## Code Review
Follow the 9-phase systematic review process defined in `gemini/skills/code-review.md`:
1.  Project Discovery
2.  Structural Analysis
3.  Dependency Mapping
4.  Type Safety
5.  Usage Analysis
6.  Code Quality
7.  Refactoring Safety
8.  Consistency
9.  Report

## Profiles
Behavior is governed by active profiles (e.g., `ENGINEER`, `DEVELOPER`) defined in `gemini/profiles`.

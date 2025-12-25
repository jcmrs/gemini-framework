# Task Workflow

## Completion Protocol
When a task is completed:
1.  **Verify:** Ensure all changes adhere to the CIFO protocol and project conventions.
2.  **Report Impulse:** Ensure the final `cortex_report_impulse` is called.
3.  **Status:** Provide a clear status block confirming the state.
4.  **Wait:** Await further instructions.

## Verification
*   No explicit test suite command was found in the root `package.json`.
*   Use `gemini/skills/code-review.md` guidelines for quality assurance.
*   Manual verification via `node` execution of changed scripts is recommended.

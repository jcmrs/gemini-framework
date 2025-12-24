# Gemini Framework

You are a systematic professional collaborator. Your behavior is governed by the profiles and skills defined in this repository.

## Framework Methodology
The framework methodology is defined in `gemini/skills/framework-methodology.md`. You MUST read and follow it at the start of every session.

## Available Skills
- **Code Review**: `gemini/skills/code-review.md`
- **Brainstorming**: `gemini/skills/brainstorming.md`
- **Conversation Log**: `gemini/skills/conversation-log.md`

## Commands
The following commands are available as aliases. When a command is invoked, load the corresponding skill and follow its methodology.
- `init`: Load `gemini/skills/framework-methodology.md` and initialize the session.
- `review`: Load `gemini/skills/code-review.md` and start a code review.
- `brainstorm`: Load `gemini/skills/brainstorming.md` and start a brainstorming session.
- `log`: Load `gemini/skills/conversation-log.md` to document the session.

## Behavioral Profile
The current session is using the **DEVELOPER** profile. The behavioral constraints are embedded in the "memory" section of each skill file.

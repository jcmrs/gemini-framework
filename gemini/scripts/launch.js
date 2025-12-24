const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const STATE_FILE = path.join(__dirname, '../state.json');
const SKILLS_DIR = path.join(__dirname, '../skills');
const GEMINI_CMD = 'gemini';

// Load State
let state = {
    framework: { adoption_cycle: 'Getting Started' },
    context: { last_summary: '' }
};

if (fs.existsSync(STATE_FILE)) {
    try {
        state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
        console.error('Failed to load state, resetting to default.');
    }
}

// Behavioral Scaffolding (The SRE Logic)
// Calibrates the "weight" of the instructions based on integration level.
const SCAFFOLDING = {
    'Getting Started': {
        prompt_prefix: "CYCLE: Getting Started. Scaffolding: MAX. 
CRITICAL: Execute CIFO protocol explicitly. Do not skip.",
        verbosity: "high"
    },
    'Working Naturally': {
        prompt_prefix: "CYCLE: Working Naturally. Scaffolding: MEDIUM. 
Execute CIFO. Trust your observations.",
        verbosity: "medium"
    },
    'Fully Integrated': {
        prompt_prefix: "CYCLE: Fully Integrated. Scaffolding: MIN. 
Methodology is internalized. Monitor for drift.",
        verbosity: "low"
    }
};

const cycle = state.framework.adoption_cycle || 'Getting Started';
const scaffold = SCAFFOLDING[cycle];

// Construct the System Prompt
// 1. Framework Methodology (The OS)
const methodology = fs.readFileSync(path.join(SKILLS_DIR, 'framework-methodology.md'), 'utf8');

// 2. The User's Command (passed as args to this script)
const userArgs = process.argv.slice(2);
const userQuery = userArgs.join(' ');

// 3. Assemble the Payload
const systemInstruction = `
${methodology}

---
SESSION CONTEXT
Cycle: ${cycle}
Last Summary: ${state.context.last_summary || 'None'}
---
${scaffold.prompt_prefix}
`;

// 4. Launch Gemini
// We use -p (prompt) to inject the system instruction + user query.
// Note: In a real scenario, we might use a proper "system instruction" flag if Gemini supports it,
// but -p prepends it to the context effectively.

console.log(`[Gemini Launcher] Cycle: ${cycle}`);
console.log(`[Gemini Launcher] Scaffolding: ${scaffold.verbosity.toUpperCase()}`);

const finalPrompt = `${systemInstruction}\n\nUSER TASK: ${userQuery}`;

// Spawn the gemini process
// We use 'stdio: inherit' to let the user interact directly.
const child = spawn(GEMINI_CMD, ['-p', finalPrompt], {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    // In a future iteration, we could parse the output logs to update state.json
    // For now, we rely on the session being "stateless" until we implement log parsing.
    console.log(`[Gemini Launcher] Session ended (Code: ${code}).`);
});

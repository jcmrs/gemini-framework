const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Hydrator = require('../lib/hydrator');
const StateManager = require('../lib/state_manager');

// Paths
const ROOT_DIR = path.resolve(__dirname, '../../../');
const CONFIG_PATH = path.join(ROOT_DIR, 'gemini/config.json');
const STATE_PATH = path.join(ROOT_DIR, 'gemini/state.json');
const SKILLS_DIR = path.join(ROOT_DIR, 'gemini/skills');

// Initialize Components
const hydrator = new Hydrator(CONFIG_PATH);
const stateManager = new StateManager(STATE_PATH);

// Hydrate Memory
const memory = hydrator.hydrate();
const cycle = stateManager.state.framework.adoption_cycle;

// Scaffolding Logic (The SRE Config)
const SCAFFOLDING = {
    'Getting Started': {
        prefix: "CYCLE: Getting Started. Scaffolding: MAX. 
CRITICAL: Execute CIFO protocol explicitly. Do not skip.",
        verbosity: "high"
    },
    'Working Naturally': {
        prefix: "CYCLE: Working Naturally. Scaffolding: MEDIUM. 
Execute CIFO. Trust your observations.",
        verbosity: "medium"
    },
    'Fully Integrated': {
        prefix: "CYCLE: Fully Integrated. Scaffolding: MIN. 
Methodology is internalized. Monitor for drift.",
        verbosity: "low"
    }
};

const scaffold = SCAFFOLDING[cycle] || SCAFFOLDING['Getting Started'];

// Construct Prompt
const methodology = fs.readFileSync(path.join(SKILLS_DIR, 'framework-methodology.md'), 'utf8');
const userQuery = process.argv.slice(2).join(' ');

// Inject Memory into Methodology (Dynamic Hydration)
const memoryJson = JSON.stringify({ profiles: memory }, null, 2);
const hydratedMethodology = methodology.replace(
    /(<!-- framework-memory-start -->)[\s\S]*?(<!-- framework-memory-end -->)/,
    `$1\n\
```json\
${memoryJson}
\
```\n$2`
);

const systemPrompt = `
${hydratedMethodology}

---
SESSION CONTEXT
Cycle: ${cycle}
Last Summary: ${stateManager.state.context.last_summary || 'None'}
---
${scaffold.prefix}
`;

const finalPrompt = `${systemPrompt}\n\nUSER TASK: ${userQuery}`;

console.log(`[Kernel] Initialized. Cycle: ${cycle}`);
console.log(`[Kernel] Spawning Gemini...`);

// Spawn Gemini
// Note: We use 'inherit' for stdin/stdout to allow interactive mode for now.
// A full 'Supervisor' interception requires piping, which disables the TUI.
// For this iteration, we trust the model to see the prompt, and we rely on
// the 'launch' mechanism to set the stage.
// Future: Use 'pipe' and a custom TUI to intercept output.

const child = spawn('gemini', ['-p', finalPrompt], {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    console.log(`[Kernel] Session ended.`);
    // Here we would parse logs if we were piping stdout
});

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Synapse = require('../lib/synapse');
const Hippocampus = require('../lib/hippocampus');

// Paths
const ROOT_DIR = path.resolve(__dirname, '../../../');
const CONFIG_PATH = path.join(ROOT_DIR, 'gemini/config.json');
const STATE_PATH = path.join(ROOT_DIR, 'gemini/state.json');
const SKILLS_DIR = path.join(ROOT_DIR, 'gemini/skills');

// Initialize The Brain
const synapse = new Synapse(CONFIG_PATH);
const hippocampus = new Hippocampus(STATE_PATH);

// Recall & Orient
const activeProfile = synapse.config.settings.profile; // e.g., "DEVELOPER"
const memory = synapse.synthesizeMemory(activeProfile);
const cycle = hippocampus.state.framework.adoption_cycle;

// Scaffolding (The SRE Configuration)
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

// Context Engineering (The Biome)
const methodology = fs.readFileSync(path.join(SKILLS_DIR, 'framework-methodology.md'), 'utf8');
const userQuery = process.argv.slice(2).join(' ');

// Inject Memory into Methodology (Dynamic Synaptic Weighting)
const memoryJson = JSON.stringify({ profiles: memory }, null, 2);
const hydratedMethodology = methodology.replace(
    /(<!-- framework-memory-start -->)[\s\S]*?(<!-- framework-memory-end -->)/,
    `$1\n\
```json\
${memoryJson}
\
```
$2`
);

const systemPrompt = `
${hydratedMethodology}

---
SESSION CONTEXT
Active Profile: ${activeProfile} (Inheritance Resolved)
Cycle: ${cycle}
Last Summary: ${hippocampus.state.context.last_summary || 'None'}
---
${scaffold.prefix}
`;

const finalPrompt = `${systemPrompt}\n\nUSER TASK: ${userQuery}`;

console.log(`[Cortex] Active Profile: ${activeProfile}`);
console.log(`[Cortex] Cycle: ${cycle}`);
console.log(`[Cortex] Engaging Language Center (Gemini)...`);

// Launch The Organism
// We use 'inherit' for now, but this is where the "Loop" would intercept output
// to perform the "Psychologist" analysis before showing it to the user.
const child = spawn('gemini', ['-p', finalPrompt], {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    // In the future: Parse stdout logs here -> Call hippocampus.consolidate(metrics)
    console.log(`[Cortex] Session Complete.`);
});

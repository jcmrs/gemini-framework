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
const synapse = new Synapse(CONFIG_PATH, ROOT_DIR);
const hippocampus = new Hippocampus(STATE_PATH);

// Recall & Orient
const activeProfile = synapse.config.settings.profile; // e.g., "DEVELOPER"
const memory = synapse.synthesizeMemory(activeProfile);
const cycle = hippocampus.state.framework.adoption_cycle;

// Scaffolding (The SRE Configuration)
const SCAFFOLDING = {
    'Getting Started': {
        prefix: 'CYCLE: Getting Started. Scaffolding: MAX.\nCRITICAL: Execute CIFO protocol explicitly. Do not skip.',
        verbosity: "high"
    },
    'Working Naturally': {
        prefix: 'CYCLE: Working Naturally. Scaffolding: MEDIUM.\nExecute CIFO. Trust your observations.',
        verbosity: "medium"
    },
    'Fully Integrated': {
        prefix: 'CYCLE: Fully Integrated. Scaffolding: MIN.\nMethodology is internalized. Monitor for drift.',
        verbosity: "low"
    }
};

const scaffold = SCAFFOLDING[cycle] || SCAFFOLDING['Getting Started'];

// Context Engineering (The Biome)
const methodology = fs.readFileSync(path.join(SKILLS_DIR, 'framework-methodology.md'), 'utf8');
const userQuery = process.argv.slice(2).join(' ');

// Inject Memory into Methodology (Dynamic Synaptic Weighting)
const memoryJson = JSON.stringify({ profiles: memory }, null, 2);
const jsonBlock = "<!-- framework-memory-start -->\n```json\n" + memoryJson + "\n```\n<!-- framework-memory-end -->";

const hydratedMethodology = methodology.replace(
    /(<!-- framework-memory-start -->)[\s\S]*?(<!-- framework-memory-end -->)/,
    jsonBlock
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
console.log(`[Cortex] Attempting to spawn 'gemini' (Native) with context...`);

const isWindows = process.platform === 'win32';
const shell = isWindows ? 'powershell.exe' : true;

// 1. Write the Context to a file to bypass CLI limits
const contextFile = path.join(__dirname, '../memory/active_context.md');
fs.writeFileSync(contextFile, finalPrompt, 'utf8');
console.log(`[Cortex] Context written to: ${contextFile}`);

// 2. Construct a "Pointer Prompt" that fits in the CLI
const bootPrompt = `SYSTEM BOOT: You are the Gemini Cognitive Organism. Your core behavioral architecture is defined in the file "${contextFile}". You MUST read this file immediately and adopt the CIFO protocol defined within it. Do not hallucinate; read the file. Await user input only after initializing.`;

// 3. Spawn Gemini in Interactive Mode with the Pointer Prompt
const child = spawn('gemini', ['-i', `"${bootPrompt.replace(/"/g, '\\"')}"`], {
    stdio: 'inherit', // Let the user interact directly with the TTY
    shell: shell
});

// SAFETY: Cleanup child process on termination
const cleanup = () => {
    if (child && !child.killed) {
        console.log('\n[Cortex] Terminating Neural Link...');
        try {
            process.stdin.unpipe(child.stdin);
            child.kill();
        } catch (e) {
            // Ignore kill errors
        }
    }
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

child.on('error', (err) => {
    console.error(`\n[Cortex CRITICAL ERROR] Failed to launch 'gemini'.`);
    console.error(`Error details: ${err.message}`);
});

child.on('spawn', () => {
    console.log(`[Cortex] Neural Link Established. Boot sequence initiated.`);
});

child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
        console.log(`[Cortex] Session ended with code ${code}.`);
    } else {
        console.log(`[Cortex] Session Complete.`);
    }
    process.exit(code || 0);
});

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const upstreamRepo = 'https://github.com/jcmrs/claude';
const upstreamDir = path.join(__dirname, '../../UPSTREAM/claude-skills-platform');
const geminiDir = path.join(__dirname, '../../gemini');

function run(command, cwd = process.cwd()) {
  console.log(`Running: ${command}`);
  return execSync(command, { cwd, stdio: 'inherit' });
}

// 1. Update upstream
if (!fs.existsSync(upstreamDir)) {
  console.log('Cloning upstream...');
  run(`git clone ${upstreamRepo} ${upstreamDir}`);
} else {
  console.log('Updating upstream...');
  run(`git pull`, upstreamDir);
}

// 2. Sync profiles
console.log('Syncing profiles...');
run(`cp -r ${upstreamDir}/plugins/framework/skills/framework-initialization/scripts/memory/profiles/* ${geminiDir}/profiles/`);

// 3. Sync skills
console.log('Syncing skills...');
const skillMap = {
  'brainstorming/skills/brainstorming/SKILL.md': 'brainstorming.md',
  'code-review/skills/code-review/SKILL.md': 'code-review.md',
  'conversation-log/skills/conversation-log/SKILL.md': 'conversation-log.md',
  'framework/skills/framework-methodology/SKILL.md': 'framework-methodology.md'
};

for (const [src, dest] of Object.entries(skillMap)) {
  run(`cp ${upstreamDir}/plugins/${src} ${geminiDir}/skills/${dest}`);
}

// 4. Sync commands
console.log('Syncing commands...');
const commandMap = {
  'code-review/commands/review.md': 'review.md',
  'brainstorming/commands/brainstorm.md': 'brainstorm.md',
  'conversation-log/commands/log.md': 'log.md',
  'framework/commands/init.md': 'init.md',
  'framework/commands/package.md': 'package.md'
};

for (const [src, dest] of Object.entries(commandMap)) {
  run(`cp ${upstreamDir}/plugins/${src} ${geminiDir}/commands/${dest}`);
}

// 5. Sync vendor
console.log('Syncing vendor...');
run(`cp ${upstreamDir}/plugins/framework/skills/framework-initialization/scripts/memory/lib/vendor/js-yaml.min.js ${geminiDir}/scripts/vendor/`);

// 6. Run hydration
console.log('Running hydration...');
run(`node ${geminiDir}/scripts/hydrate.js`);

console.log('Sync complete!');

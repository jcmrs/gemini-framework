const path = require('path');
const fs = require('fs');
const Synapse = require('../cortex/lib/synapse');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CONFIG_PATH = path.join(ROOT_DIR, 'gemini/config.json');
const CACHE_DIR = path.join(ROOT_DIR, '.serena/cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

console.log('Hydrating memory graph...');

try {
  const synapse = new Synapse(CONFIG_PATH);
  const activeProfile = synapse.config.settings.profile;
  console.log(`Active Profile: ${activeProfile}`);

  const memory = synapse.synthesizeMemory(activeProfile);
  const outputPath = path.join(CACHE_DIR, 'memory-graph.json');

  fs.writeFileSync(outputPath, JSON.stringify(memory, null, 2));
  console.log(`Memory graph cached at: ${outputPath}`);
} catch (error) {
  console.error('Hydration failed:', error);
  process.exit(1);
}

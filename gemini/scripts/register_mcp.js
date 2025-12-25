const fs = require('fs');
const path = require('path');
const os = require('os');

const USER_HOME = os.homedir();
const SETTINGS_PATH = path.join(USER_HOME, '.gemini', 'settings.json');
const SERVER_SCRIPT = path.resolve(__dirname, '../mcp-server/src/index.js');

console.log('Registering Cortex MCP Server...');

try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    
    // Add Cortex Server
    settings.mcpServers = settings.mcpServers || {};
    settings.mcpServers.cortex = {
        command: 'node',
        args: [SERVER_SCRIPT],
        env: {
            NODE_ENV: 'production'
        },
        disabled: false,
        autoApprove: []
    };

    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    console.log(`Successfully registered 'cortex' in ${SETTINGS_PATH}`);
    console.log(`Server Path: ${SERVER_SCRIPT}`);
} catch (e) {
    console.error('Failed to register server:', e);
}

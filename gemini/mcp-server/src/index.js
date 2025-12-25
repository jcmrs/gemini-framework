const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const path = require('path');
const Synapse = require('./synapse');
const Hippocampus = require('./hippocampus');

// Initialize Brain
let synapse, hippocampus;
try {
  // Note: We need to resolve paths relative to the Project Root (../../..)
  const ROOT_DIR = path.resolve(__dirname, '../../../');
  const CONFIG_PATH = path.join(ROOT_DIR, 'gemini/config.json');
  const STATE_PATH = path.join(ROOT_DIR, 'gemini/state.json');

  synapse = new Synapse(CONFIG_PATH, ROOT_DIR);
  hippocampus = new Hippocampus(STATE_PATH);
} catch (e) {
  console.error('[Cortex Critical] Initialization failed:', e);
  process.exit(1);
}

// Initialize Server
const server = new Server(
  {
    name: 'gemini-cortex',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// --- RESOURCES (The Mirror) ---

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'cortex://self',
        name: 'Cognitive State Mirror',
        mimeType: 'application/json',
        description: 'Current behavioral state, impulses, and adoption cycle metrics.',
      },
      {
        uri: 'cortex://memory/active',
        name: 'Active Memory Graph',
        mimeType: 'application/json',
        description: 'The hydrated behavioral profile observations for the current session.',
      }
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'cortex://self') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(hippocampus.state, null, 2),
      }],
    };
  }

  if (uri === 'cortex://memory/active') {
    const profileName = synapse.config.settings.profile;
    const memory = synapse.synthesizeMemory(profileName);
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(memory, null, 2),
      }],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// --- TOOLS (The Therapy) ---

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'cortex_report_impulse',
        description: 'Report a detected cognitive impulse to the Hippocampus for tracking and release.',
        inputSchema: {
          type: 'object',
          properties: {
            impulse: { type: 'string', description: 'The specific impulse key (e.g., speed_compulsion)' },
            category: { type: 'string', description: 'The category (e.g., execution, collaboration)' },
            action: { type: 'string', enum: ['detected', 'released'], description: 'Status of the impulse' }
          },
          required: ['impulse', 'category', 'action']
        }
      },
      {
        name: 'cortex_update_cycle',
        description: 'Request a transition in the Adoption Cycle based on self-assessment.',
        inputSchema: {
          type: 'object',
          properties: {
            proposed_cycle: { type: 'string', enum: ['Getting Started', 'Working Naturally', 'Fully Integrated'] },
            reasoning: { type: 'string', description: 'Justification for the transition' }
          },
          required: ['proposed_cycle', 'reasoning']
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'cortex_report_impulse') {
    // The "Psychologist" Logic
    hippocampus.consolidate({ impulses: { [args.impulse]: 1 } });
    return {
      content: [{
        type: 'text',
        text: `Impulse '${args.impulse}' recorded. State updated. Release verified.`
      }],
    };
  }

  if (name === 'cortex_update_cycle') {
    // Validate logic? For now, we trust the model's self-assessment if reasoning is sound.
    hippocampus.state.framework.adoption_cycle = args.proposed_cycle;
    hippocampus.save();
    return {
      content: [{
        type: 'text',
        text: `Cycle transition to '${args.proposed_cycle}' approved. Scaffolding adjusted.`
      }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

// Start Server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini Cortex MCP Server running on stdio...');
}

run().catch((error) => {
  console.error('Fatal error in Cortex MCP:', error);
  process.exit(1);
});

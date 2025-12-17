import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const TOOL_COUNT = 100;

function toolName(i: number) {
  return 'fake_tool_' + String(i).padStart(3, '0');
}

function makeInputSchema(i: number) {
  const flavor = i % 10;
  const base: any = { type: 'object', additionalProperties: false };

  if (flavor === 0) {
    return {
      ...base,
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' },
        op: { type: 'string', enum: ['add', 'sub', 'mul', 'div'], default: 'add' },
      },
      required: ['a', 'b'],
    };
  }

  if (flavor === 1) {
    return {
      ...base,
      properties: {
        query: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 5 },
        includeMeta: { type: 'boolean', default: true },
      },
      required: ['query'],
    };
  }

  if (flavor === 2) {
    return {
      ...base,
      properties: {
        userId: { type: 'string', pattern: '^[a-zA-Z0-9_-]{3,32}$' },
        tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
        since: { type: 'string', format: 'date-time' },
      },
      required: ['userId'],
    };
  }

  if (flavor === 3) {
    return {
      ...base,
      properties: {
        path: { type: 'string', description: 'A pretend file path' },
        recursive: { type: 'boolean', default: false },
        depth: { type: 'integer', minimum: 0, maximum: 10, default: 2 },
      },
      required: ['path'],
    };
  }

  if (flavor === 4) {
    return {
      ...base,
      properties: {
        ids: { type: 'array', items: { type: 'integer' }, minItems: 1, maxItems: 20 },
        mode: { type: 'string', enum: ['brief', 'full'] },
      },
      required: ['ids'],
    };
  }

  if (flavor === 5) {
    return {
      ...base,
      properties: {
        payload: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            count: { type: 'integer', minimum: 0, maximum: 1000 },
            active: { type: 'boolean' },
          },
          required: ['name'],
        },
        traceId: { type: 'string' },
      },
      required: ['payload'],
    };
  }

  if (flavor === 6) {
    return {
      ...base,
      properties: {
        text: { type: 'string' },
        transform: { type: 'string', enum: ['upper', 'lower', 'title', 'reverse'], default: 'upper' },
      },
      required: ['text'],
    };
  }

  if (flavor === 7) {
    return {
      ...base,
      properties: {
        lat: { type: 'number', minimum: -90, maximum: 90 },
        lon: { type: 'number', minimum: -180, maximum: 180 },
        radiusKm: { type: 'number', minimum: 0, maximum: 2000, default: 5 },
      },
      required: ['lat', 'lon'],
    };
  }

  if (flavor === 8) {
    return {
      ...base,
      properties: {
        currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY'], default: 'USD' },
        amount: { type: 'number', minimum: 0 },
        includeBreakdown: { type: 'boolean', default: false },
      },
      required: ['amount'],
    };
  }

  return {
    ...base,
    properties: {
      seed: { type: 'integer', minimum: 0, maximum: 1000000, default: i * 1337 },
      count: { type: 'integer', minimum: 1, maximum: 25, default: 3 },
      kind: { type: 'string', enum: ['alpha', 'beta', 'gamma'], default: 'alpha' },
    },
    required: [],
  };
}

function fauxDataFor(tool: string, args: any) {
  const now = new Date().toISOString();
  const n = Number(tool.slice(-3));

  const pseudo = (x: number) => {
    let v = (x * 1103515245 + 12345) >>> 0;
    v = (v ^ (v >>> 11)) >>> 0;
    v = (v * 2654435761) >>> 0;
    return v >>> 0;
  };

  const base = pseudo(n * 97 + (args?.seed ?? 0));
  const labels = ['oak', 'river', 'cobalt', 'ember', 'zephyr'];
  const sample = Array.from({ length: (args?.count ?? 5) }, (_, i) => {
    const v = pseudo(base + i * 31);
    return {
      id: v % 100000,
      score: Number(((v % 10000) / 10000).toFixed(4)),
      label: labels[v % labels.length],
    };
  });

  return {
    tool,
    timestamp: now,
    receivedArguments: args ?? {},
    faux: {
      summary: 'This is fake output for ' + tool + '.',
      sample,
      meta: {
        requestId: 'req_' + base.toString(16),
        elapsedMs: (base % 250) + 5,
      },
    },
  };
}

const tools = Array.from({ length: TOOL_COUNT }, (_, idx) => {
  const i = idx + 1;
  return {
    name: toolName(i),
    description: 'A fake tool (#' + i + ') that returns faux data. Signature flavor ' + ((i % 10) + 1) + '/10.',
    inputSchema: makeInputSchema(i),
  };
});

const server = new Server(
  { name: 'random-100-tools', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = request.params.name;
  const args = request.params.arguments;

  const found = tools.find((t) => t.name === tool);
  if (!found) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Unknown tool: ' + tool, hint: 'Call list_tools first.' }, null, 2),
        },
      ],
    };
  }

  const payload = fauxDataFor(tool, args);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);


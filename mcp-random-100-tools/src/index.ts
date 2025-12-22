import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const TOOL_COUNT = 2000;

// AmigaOS-themed kernel component prefixes
const AMIGA_PREFIXES = [
  'exec', 'dos', 'intuition', 'graphics', 'layers', 'workbench', 'icon',
  'gadtools', 'asl', 'commodities', 'rexx', 'iffparse', 'locale', 'keymap',
  'diskfont', 'mathffp', 'mathtrans', 'audio', 'gameport', 'input', 'timer',
  'console', 'trackdisk', 'scsi', 'clipboard', 'narrator', 'translator',
  'expansion', 'ramlib', 'potgo', 'parallel', 'serial', 'printer', 'bootmenu',
  'kickstart', 'romwack', 'sashimi', 'avail', 'assign', 'mount', 'loadwb',
  'setpatch', 'addbuffers', 'changetaskpri', 'cpu', 'memstat', 'showconfig'
];

// AmigaOS-themed operation suffixes
const AMIGA_OPERATIONS = [
  'AllocMem', 'FreeMem', 'CopyMem', 'TypeOfMem', 'AvailMem', 'AllocVec',
  'OpenLibrary', 'CloseLibrary', 'MakeLibrary', 'SumLibrary', 'SetFunction',
  'CreateTask', 'DeleteTask', 'FindTask', 'SetTaskPri', 'Signal', 'Wait',
  'AllocSignal', 'FreeSignal', 'AddPort', 'RemPort', 'PutMsg', 'GetMsg',
  'OpenWindow', 'CloseWindow', 'RefreshWindow', 'MoveWindow', 'SizeWindow',
  'ActivateWindow', 'WindowToFront', 'WindowToBack', 'BeginRefresh', 'EndRefresh',
  'OpenScreen', 'CloseScreen', 'MoveScreen', 'ScreenToFront', 'ScreenToBack',
  'CreateGadget', 'FreeGadget', 'AddGadget', 'RemoveGadget', 'RefreshGadget',
  'LoadRGB4', 'LoadRGB32', 'SetRGB4', 'SetRGB32', 'GetRGB4', 'GetRGB32',
  'BltBitMap', 'BltTemplate', 'BltClear', 'BltPattern', 'BltMaskBitMap',
  'Draw', 'Move', 'AreaMove', 'AreaDraw', 'AreaEnd', 'Flood', 'ReadPixel',
  'WritePixel', 'RectFill', 'ScrollRaster', 'DrawEllipse', 'PolyDraw',
  'Open', 'Close', 'Read', 'Write', 'Seek', 'Lock', 'UnLock', 'Examine',
  'ExNext', 'CreateDir', 'DeleteFile', 'Rename', 'SetProtection', 'SetComment',
  'AllocDosObject', 'FreeDosObject', 'ReadArgs', 'FreeArgs', 'MatchPattern',
  'ParsePattern', 'SystemTagList', 'RunCommand', 'CreateNewProc', 'LoadSeg',
  'UnLoadSeg', 'InternalLoadSeg', 'NewLoadSeg', 'AddSegment', 'FindSegment',
  'RemSegment', 'CheckSignal', 'SplitName', 'SameLock', 'SetVar', 'GetVar',
  'DeleteVar', 'FindVar', 'CliInit', 'EndCli', 'SetMode', 'ModeRequest'
];

// AmigaOS-themed descriptions based on flavor
const AMIGA_DESCRIPTIONS: Record<number, (component: string) => string> = {
  0: (c) => `${c} arithmetic coprocessor - performs math operations via the Motorola 68881/68882 FPU interface.`,
  1: (c) => `${c} pattern matcher - searches Workbench volumes using AmigaDOS wildcard syntax.`,
  2: (c) => `${c} user registry - manages Envoy network identity and multi-user credentials.`,
  3: (c) => `${c} filesystem handler - traverses OFS/FFS volumes with optional recursive descent.`,
  4: (c) => `${c} resource tracker - monitors Chip/Fast RAM allocation across multiple hunks.`,
  5: (c) => `${c} message port handler - dispatches IDCMP messages to Intuition event queues.`,
  6: (c) => `${c} text formatter - transforms strings for CLI output via CON:/RAW: devices.`,
  7: (c) => `${c} copper list generator - computes display coordinates for the Amiga copper.`,
  8: (c) => `${c} CIA timer interface - handles currency/budget via the 8520 timer subsystem.`,
  9: (c) => `${c} blitter controller - generates pseudo-random bitplanes using line-draw mode.`,
};

function toolName(i: number): string {
  const prefixIdx = i % AMIGA_PREFIXES.length;
  const opIdx = Math.floor(i / AMIGA_PREFIXES.length) % AMIGA_OPERATIONS.length;
  const variant = Math.floor(i / (AMIGA_PREFIXES.length * AMIGA_OPERATIONS.length));
  
  const prefix = AMIGA_PREFIXES[prefixIdx];
  const op = AMIGA_OPERATIONS[opIdx];
  const suffix = variant > 0 ? `_v${variant}` : '';
  
  return `${prefix}_${op}${suffix}`.toLowerCase();
}

function getComponentName(i: number): string {
  const prefixIdx = i % AMIGA_PREFIXES.length;
  return AMIGA_PREFIXES[prefixIdx] + '.library';
}

function makeInputSchema(i: number) {
  const flavor = i % 10;
  const base: any = { type: 'object', additionalProperties: false };

  if (flavor === 0) {
    return {
      ...base,
      properties: {
        a: { type: 'number', description: 'First operand (68k register D0)' },
        b: { type: 'number', description: 'Second operand (68k register D1)' },
        op: { type: 'string', enum: ['add', 'sub', 'mul', 'div'], default: 'add' },
      },
      required: ['a', 'b'],
    };
  }

  if (flavor === 1) {
    return {
      ...base,
      properties: {
        query: { type: 'string', description: 'AmigaDOS pattern (supports #?*~)' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 5 },
        includeMeta: { type: 'boolean', default: true, description: 'Include FileInfoBlock data' },
      },
      required: ['query'],
    };
  }

  if (flavor === 2) {
    return {
      ...base,
      properties: {
        userId: { type: 'string', pattern: '^[a-zA-Z0-9_-]{3,32}$', description: 'Envoy user identifier' },
        tags: { type: 'array', items: { type: 'string' }, maxItems: 10, description: 'ToolType qualifiers' },
        since: { type: 'string', format: 'date-time', description: 'Datestamp (AmigaDOS format)' },
      },
      required: ['userId'],
    };
  }

  if (flavor === 3) {
    return {
      ...base,
      properties: {
        path: { type: 'string', description: 'Volume:path/to/file (e.g., DH0:Devs/Monitors)' },
        recursive: { type: 'boolean', default: false, description: 'Descend into subdirectories' },
        depth: { type: 'integer', minimum: 0, maximum: 10, default: 2, description: 'Max directory depth' },
      },
      required: ['path'],
    };
  }

  if (flavor === 4) {
    return {
      ...base,
      properties: {
        ids: { type: 'array', items: { type: 'integer' }, minItems: 1, maxItems: 20, description: 'Hunk IDs' },
        mode: { type: 'string', enum: ['brief', 'full'], description: 'MEMF_CHIP or MEMF_FAST analysis' },
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
            name: { type: 'string', description: 'Message port name' },
            count: { type: 'integer', minimum: 0, maximum: 1000, description: 'Signal bits' },
            active: { type: 'boolean', description: 'Port is public' },
          },
          required: ['name'],
        },
        traceId: { type: 'string', description: 'Sashimi trace identifier' },
      },
      required: ['payload'],
    };
  }

  if (flavor === 6) {
    return {
      ...base,
      properties: {
        text: { type: 'string', description: 'Input string buffer' },
        transform: { type: 'string', enum: ['upper', 'lower', 'title', 'reverse'], default: 'upper', description: 'Locale transformation' },
      },
      required: ['text'],
    };
  }

  if (flavor === 7) {
    return {
      ...base,
      properties: {
        lat: { type: 'number', minimum: -90, maximum: 90, description: 'Y coordinate (0-511 PAL)' },
        lon: { type: 'number', minimum: -180, maximum: 180, description: 'X coordinate (0-719 hires)' },
        radiusKm: { type: 'number', minimum: 0, maximum: 2000, default: 5, description: 'Ellipse radius' },
      },
      required: ['lat', 'lon'],
    };
  }

  if (flavor === 8) {
    return {
      ...base,
      properties: {
        currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY'], default: 'USD', description: 'Locale currency' },
        amount: { type: 'number', minimum: 0, description: 'Value in smallest units' },
        includeBreakdown: { type: 'boolean', default: false, description: 'Show CIA timer breakdown' },
      },
      required: ['amount'],
    };
  }

  return {
    ...base,
    properties: {
      seed: { type: 'integer', minimum: 0, maximum: 1000000, default: i * 1337, description: 'PRNG seed for blitter' },
      count: { type: 'integer', minimum: 1, maximum: 25, default: 3, description: 'Number of bitplanes' },
      kind: { type: 'string', enum: ['alpha', 'beta', 'gamma'], default: 'alpha', description: 'DMA channel priority' },
    },
    required: [],
  };
}

function fauxDataFor(tool: string, args: any) {
  const now = new Date().toISOString();
  const match = tool.match(/_v(\d+)$/);
  const variant = match ? parseInt(match[1], 10) : 0;
  const cleanTool = tool.replace(/_v\d+$/, '');
  
  const pseudo = (x: number) => {
    let v = (x * 1103515245 + 12345) >>> 0;
    v = (v ^ (v >>> 11)) >>> 0;
    v = (v * 2654435761) >>> 0;
    return v >>> 0;
  };

  const n = cleanTool.split('_').reduce((acc, s) => acc + s.charCodeAt(0), 0) + variant;
  const base = pseudo(n * 97 + (args?.seed ?? 0));
  
  const labels = ['ChipMem', 'FastMem', 'ROMTag', 'Resident', 'LibBase'];
  const sample = Array.from({ length: (args?.count ?? 5) }, (_, i) => {
    const v = pseudo(base + i * 31);
    return {
      hunkId: v % 100000,
      memType: v % 2 === 0 ? 'MEMF_CHIP' : 'MEMF_FAST',
      score: Number(((v % 10000) / 10000).toFixed(4)),
      label: labels[v % labels.length],
    };
  });

  return {
    tool,
    timestamp: now,
    kickstartVersion: '3.2.2',
    receivedArguments: args ?? {},
    execOutput: {
      summary: `Exec.library dispatch for ${tool} completed.`,
      sample,
      meta: {
        requestId: 'msg_' + base.toString(16),
        elapsedTicks: (base % 250) + 5,
        vblankCount: Math.floor((base % 250) / 20),
      },
    },
  };
}

const tools = Array.from({ length: TOOL_COUNT }, (_, idx) => {
  const i = idx + 1;
  const flavor = i % 10;
  const component = getComponentName(i);
  const descFn = AMIGA_DESCRIPTIONS[flavor];
  
  return {
    name: toolName(i),
    description: descFn(component),
    inputSchema: makeInputSchema(i),
  };
});

const server = new Server(
  { name: 'amiga-exec-2000', version: '3.2.0' },
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
          text: JSON.stringify({ 
            error: 'exec.library: Unknown function vector: ' + tool, 
            guru: '80000003',
            hint: 'Call list_tools to enumerate available library functions.' 
          }, null, 2),
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

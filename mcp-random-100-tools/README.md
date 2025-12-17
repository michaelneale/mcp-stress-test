# mcp-random-100-tools

An MCP server that exposes **100 fake tools** with varied input signatures (JSON Schemas) and returns **faux data**.

## Run

```bash
cd mcp-random-100-tools
npm install
npm run build
npm start
```

The server speaks MCP over stdio.

## Tools

Tools are named:

- `fake_tool_001`
- ...
- `fake_tool_100`

Each tool returns JSON text including:

- the tool name
- a timestamp
- the received arguments
- a deterministic (but fake) sample payload


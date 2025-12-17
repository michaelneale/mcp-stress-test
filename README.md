# mega mcp test

this is a test MCP, which does nothing, but exposes 2000+ tools (fake tools) to stress test an MCP client/agent and validate enhancements like "code mode" https://www.anthropic.com/engineering/code-execution-with-mcp

To run: 

use `/Users/.../run.sh` or similar as cmd arg for a stdio mcp server in your agent (such as goose). 

# results

Testing standard goose which uses LLM tool calling results in this: 


With code mode enabled: 

# Notes

goose has a platform extension which can be enabled as "code_execution". This changes the behavior to avoid using native LLM tool calling and use a sandbox environment to script up calls to MCPs (but otherwise operates the same) with limited tools. This allows it to scale to any number of tools and extensions. 

read more: https://www.anthropic.com/engineering/code-execution-with-mcp

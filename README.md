# mega mcp test

this is a test MCP, which does nothing, but exposes 2000+ tools (fake tools) to stress test an MCP client/agent and validate enhancements like "code mode" https://www.anthropic.com/engineering/code-execution-with-mcp

To run: 

use `/Users/.../run.sh` or similar as cmd arg for a stdio mcp server in your agent (such as goose). 

# results

Testing standard goose which uses LLM tool calling results in this: 

<img width="589" height="101" alt="image" src="https://github.com/user-attachments/assets/26e74180-e950-4060-b287-4ea0e1a4c486" />

and claude code with it: 

<img width="1054" height="183" alt="image" src="https://github.com/user-attachments/assets/d24a3f67-45ab-4baa-8236-bfa48aa34007" />



With code mode enabled: 

<img width="530" height="230" alt="image" src="https://github.com/user-attachments/assets/d519800d-5090-4a42-8f06-f0299031e4f3" />

and even allows it to reflect on this absurd MCP server with its many tools: 



<img width="696" height="351" alt="image" src="https://github.com/user-attachments/assets/b6d657b6-1311-4f01-a86e-5357e8c29c9f" />



# Notes

goose has a platform extension which can be enabled as "code_execution". This changes the behavior to avoid using native LLM tool calling and use a sandbox environment to script up calls to MCPs (but otherwise operates the same) with limited tools. This allows it to scale to any number of tools and extensions. 

read more: https://www.anthropic.com/engineering/code-execution-with-mcp

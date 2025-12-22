# Amiga Exec 2000 - MCP Test Server

An MCP (Model Context Protocol) server that exposes **2000 AmigaOS-themed kernel tools** for testing purposes.

## 🖥️ Overview

Instead of generic "fake_tool_XXXX" names, this server generates authentic-sounding AmigaOS library functions like:

- `exec_allocmem` - Memory allocation via exec.library
- `intuition_openwindow` - Window management via intuition.library  
- `graphics_bltbitmap` - Blitter operations via graphics.library
- `dos_loadseg` - Segment loading via dos.library
- ...and 1996 more!

## 🔧 Tool Naming Convention

Tool names are generated from combinations of:

### Library Prefixes (46 total)
Classic AmigaOS libraries and commands:
`exec`, `dos`, `intuition`, `graphics`, `layers`, `workbench`, `icon`, `gadtools`, `asl`, `commodities`, `rexx`, `iffparse`, `locale`, `keymap`, `diskfont`, `mathffp`, `mathtrans`, `audio`, `gameport`, `input`, `timer`, `console`, `trackdisk`, `scsi`, `clipboard`, `narrator`, `translator`, `expansion`, `ramlib`, `potgo`, `parallel`, `serial`, `printer`, `bootmenu`, `kickstart`, `romwack`, `sashimi`, `avail`, `assign`, `mount`, `loadwb`, `setpatch`, `addbuffers`, `changetaskpri`, `cpu`, `memstat`, `showconfig`

### Operations (100 total)
Classic AmigaOS function names like:
`AllocMem`, `FreeMem`, `OpenLibrary`, `CreateTask`, `OpenWindow`, `BltBitMap`, `LoadSeg`, etc.

## 📝 Descriptions

Each tool gets an AmigaOS-flavored description referencing real Amiga concepts:
- Motorola 68881/68882 FPU
- Chip/Fast RAM and memory hunks
- IDCMP messages and Intuition events
- Copper lists and blitter operations
- OFS/FFS filesystems
- CIA timers
- And more!

## 🎮 Response Format

Responses include authentic AmigaOS-style data:
```json
{
  "tool": "exec_allocmem",
  "timestamp": "2024-12-22T14:00:00.000Z",
  "kickstartVersion": "3.2.2",
  "execOutput": {
    "summary": "Exec.library dispatch for exec_allocmem completed.",
    "sample": [
      { "hunkId": 12345, "memType": "MEMF_CHIP", "score": 0.4567, "label": "ChipMem" }
    ],
    "meta": {
      "requestId": "msg_a1b2c3d4",
      "elapsedTicks": 42,
      "vblankCount": 2
    }
  }
}
```

## 🚀 Usage

```bash
# Build
npm run build

# Run
node dist/index.js
```

## 🎯 Purpose

This server is designed for:
- Testing MCP clients with large tool registries
- Benchmarking tool discovery and selection
- Stress testing with varied parameter schemas
- Having fun with Amiga nostalgia! 

## Version

- Server: `amiga-exec-2000` v3.2.0 (matching Kickstart 3.2!)
- Tools: 2000

# ProCode — Free AI Coding Agent

```bash
curl -fsSL https://raw.githubusercontent.com/ishan1501/procode/main/install.sh | bash
```

```bash
procode                    # interactive terminal UI
procode "make a website"   # one-shot code generation
procode /sh "npm test"     # run a command
```

## Features

| Command | Description |
|---------|-------------|
| `/read <file>` | Read file with syntax highlight |
| `/write <file>` | Write content to file |
| `/edit <file>` | Edit existing file |
| `/diff <file>` | Git diff for file |
| `/status` | Git working tree status |
| `/sh <cmd>` | Run shell command |
| `/grep <q>` | Search file contents |
| `/glob <p>` | Find files by pattern |
| `/undo` | Undo last AI exchange |
| `/export` | Export session to markdown |
| `/stats` | Session token & budget stats |
| `/models` | List model chain |
| `/save <name>` | Save session |
| `/load <name>` | Load session |
| `/sessions` | List saved sessions |
| `@file` | Fuzzy attach file to message |
| `!cmd` | Inline shell execution |

## Free Model Chain

```
DS V4 Pro (NVIDIA) → Llama4 Maverick (NVIDIA) → Nemotron S49 (NVIDIA) → Nem Reason (OR free)
```

5 routes, 4 models, zero cost. Auto-switches on failure.

## Token Tracking

Real token usage displayed per session — prompt tokens, completion tokens, and total.

## Requirements

- Python 3.11+
- Internet connection

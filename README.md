# ProCode

AI coding agent in your terminal. One command to install — zero config needed.

```bash
curl -fsSL https://raw.githubusercontent.com/ishan1501/procode/main/install.sh | bash
```

```bash
procode                    # interactive session
procode "make a website"   # one-shot code gen
procode /sh "npm test"     # run a command
```

## Features

| Command | Description |
|---------|-------------|
| `/read <file>` | Read file with syntax highlighting |
| `/write <file>` | Write content to file |
| `/edit <file>` | Edit existing file |
| `/diff <file>` | Git diff for file |
| `/status` | Git working tree status |
| `/sh <cmd>` | Run shell command |
| `/grep <q>` | Search file contents |
| `/glob <p>` | Find files by pattern |
| `/undo` | Undo last AI exchange |
| `/export` | Export session to markdown |
| `/budget` | Show credit usage |
| `/models` | List model fallback chain |
| `/save <name>` | Save session |
| `/load <name>` | Load session |
| `/sessions` | List saved sessions |
| `@file` | Fuzzy attach file to message |
| `!cmd` | Inline shell execution |

## Model Chain

```
Sol Pro (OR) → DS V4 Pro (NV) → DS V4 Flash (NV) → Llama4 (NV) → Nemotron S49 (NV) → Nem Reason (OR free)
```

6 tiers, 9 routes — automatic fallback on any failure. No errors shown to user.

## Requirements

- Python 3.11+
- Internet connection

Install script handles everything else automatically.

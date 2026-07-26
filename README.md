# ProCode

AI coding agent in your terminal. One command to install, zero config.

```bash
curl -fsSL https://raw.githubusercontent.com/ishan1501/procode/main/install.sh | bash
```

Then:

```bash
procode                    # start interactive session
procode "build a website"  # one-shot code generation
procode /sh "npm test"     # run a command
```

## Features

| Command | Description |
|---------|-------------|
| `/read <file>` | Read a file |
| `/write <file>` | Write content to file |
| `/edit <file>` | Edit an existing file |
| `/sh <cmd>` | Run shell command |
| `/grep <q>` | Search file contents |
| `/glob <p>` | Find files by pattern |
| `/undo` | Undo last exchange |
| `/export` | Export session to markdown |
| `/budget` | Show API credit usage |
| `/models` | List available models |
| `/save /load` | Save/load sessions |
| `/sessions` | List saved sessions |
| `@file` | Attach file (fuzzy search) |
| `!command` | Inline shell execution |

### Models

- **Primary:** GPT-5.6 Sol Pro (OpenRouter) — requires $5+ credits
- **Fallback:** DeepSeek V4 Pro (NVIDIA) — unlimited, free, automatic

## Requirements

- Python 3.11+
- Internet connection

The install script handles everything else automatically.

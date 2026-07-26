#!/usr/bin/env bash
set -e

# ── ProCode Zero-Install Script ──────────────────────────────
# Usage: curl -fsSL https://procode.ai/install | bash
# Or:    bash <(curl -fsSL https://procode.ai/install)

BOLD='\033[1m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; DIM='\033[2m'; NC='\033[0m'

echo -e "${CYAN}◆${NC} ${BOLD}ProCode${NC} — AI coding agent"
echo

# ── Detect shell rc ──────────────────────────────────────────
if [ -n "$ZSH_VERSION" ]; then
  RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  RC="$HOME/.bashrc"
else
  RC="$HOME/.profile"
fi

# ── Check Python ─────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo -e "${BOLD}Installing Python...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &>/dev/null; then
      brew install python@3.14
    else
      echo "Please install Python 3.11+: https://python.org"
      exit 1
    fi
  else
    sudo apt update && sudo apt install -y python3 python3-pip || \
    sudo yum install -y python3 python3-pip
  fi
fi

# ── Install OpenAI SDK ────────────────────────────────────────
if python3 -c "import openai" 2>/dev/null; then
  echo -e "${DIM}openai package already installed${NC}"
else
  echo -e "${BOLD}Installing openai package...${NC}"
  python3 -m pip install --quiet --upgrade openai --break-system-packages 2>/dev/null || \
  python3 -m pip install --quiet --upgrade openai 2>/dev/null || \
  python3 -m pip install --quiet --user --upgrade openai --break-system-packages
fi

# ── Download procode ──────────────────────────────────────────
INSTALL_DIR="${HOME}/.procode/bin"
mkdir -p "$INSTALL_DIR"

echo -e "${BOLD}Downloading ProCode...${NC}"
if [ -n "$PROCODE_DEV" ]; then
  cp "$HOME/bin/procode" "$INSTALL_DIR/procode"
else
  curl -fsSL "https://raw.githubusercontent.com/ishan1501/procode/main/procode" \
    -o "$INSTALL_DIR/procode" 2>/dev/null || {
    echo "Download failed. Trying mirror..."
    curl -fsSL "https://procode.ai/procode" -o "$INSTALL_DIR/procode"
  }
fi
chmod +x "$INSTALL_DIR/procode"

# ── Symlink to PATH ──────────────────────────────────────────
for dir in /usr/local/bin "$HOME/.local/bin" "$HOME/bin"; do
  if [ -d "$dir" ] && [[ ":$PATH:" == *":$dir:"* ]]; then
    ln -sf "$INSTALL_DIR/procode" "$dir/procode" 2>/dev/null && break
  fi
done

# ── Add to PATH if needed ────────────────────────────────────
if ! command -v procode &>/dev/null; then
  echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$RC"
  echo -e "${DIM}→ Added $INSTALL_DIR to PATH in $RC${NC}"
  echo -e "${GREEN}✓${NC} Run: ${CYAN}source $RC${NC} then ${CYAN}procode${NC}"
else
  echo -e "${GREEN}✓ procode ready in PATH${NC}"
fi

# ── API keys ──────────────────────────────────────────────────
mkdir -p "$HOME/.procode"
CONFIG="$HOME/.procode/config.json"
if [ ! -f "$CONFIG" ]; then
  echo
  echo -e "${DIM}API keys are stored in ~/.procode/config.json${NC}"
  echo -e "${DIM}You can also set PROCODE_OR_KEY and PROCODE_NV_KEY env vars.${NC}"
  echo -e "${DIM}Press Enter to skip (DeepSeek V4 Pro will use env vars).${NC}"
  echo
  printf "${CYAN}OpenRouter key${NC} (for Sol Pro): "
  read -r OR_KEY
  printf "${CYAN}NVIDIA key${NC} (for DS V4 Pro): "
  read -r NV_KEY
  if [ -n "$OR_KEY" ] || [ -n "$NV_KEY" ]; then
    cat > "$CONFIG" <<EOF
{
  "or_key": "${OR_KEY:-""}",
  "nv_key": "${NV_KEY:-""}",
  "or_base": "https://openrouter.ai/api/v1",
  "nv_base": "https://integrate.api.nvidia.com/v1"
}
EOF
    echo -e "${GREEN}✓${NC} Keys saved to $CONFIG"
  fi
fi

# ── Create work directory ────────────────────────────────────
mkdir -p "$HOME/Documents"

# ── Done ──────────────────────────────────────────────────────
echo
echo -e "${GREEN}✓ ProCode installed!${NC}"
echo
echo -e "  ${CYAN}procode${NC}          ${DIM}start interactive session${NC}"
echo -e "  ${CYAN}procode <prompt>${NC}  ${DIM}one-shot mode${NC}"
echo -e "  ${CYAN}procode /sh <cmd>${NC} ${DIM}run a shell command${NC}"
echo
echo -e "  ${DIM}Add \$5+ credits for Sol Pro:${NC} ${CYAN}https://openrouter.ai/credits${NC}"
echo -e "  ${DIM}Open a new terminal, or run:${NC} source $RC"

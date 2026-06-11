#!/usr/bin/env bash
# Blender MCP setup for macOS / Linux.
# Installs uv, downloads the blender-mcp addon, and registers the MCP server
# in Claude Desktop's config. Safe to re-run; backs up your existing config.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADDON_URL="https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py"

echo "==> Blender MCP setup"

# --- 1. uv ------------------------------------------------------------------
if ! command -v uvx >/dev/null 2>&1; then
  echo "==> Installing uv (provides the 'uvx' runner)..."
  if [[ "$(uname)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    brew install uv
  else
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Fresh installs land in ~/.local/bin, which isn't on PATH yet in this shell
    export PATH="$HOME/.local/bin:$PATH"
  fi
fi

UVX_PATH="$(command -v uvx)"
echo "==> uvx found at: $UVX_PATH"

# --- 2. addon.py --------------------------------------------------------------
echo "==> Downloading addon.py from ahujasid/blender-mcp..."
curl -LsSf "$ADDON_URL" -o "$SCRIPT_DIR/addon.py"
echo "==> Saved to $SCRIPT_DIR/addon.py"

# --- 3. Claude Desktop config -------------------------------------------------
if [[ "$(uname)" == "Darwin" ]]; then
  CONFIG_DIR="$HOME/Library/Application Support/Claude"
else
  CONFIG_DIR="$HOME/.config/Claude"
fi
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
mkdir -p "$CONFIG_DIR"

if [[ -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%Y%m%d%H%M%S)"
  echo "==> Backed up existing config"
fi

UVX_PATH="$UVX_PATH" CONFIG_FILE="$CONFIG_FILE" python3 - <<'PY'
import json, os

config_file = os.environ["CONFIG_FILE"]
uvx_path = os.environ["UVX_PATH"]

config = {}
if os.path.exists(config_file):
    with open(config_file) as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError:
            raise SystemExit(f"ERROR: {config_file} contains invalid JSON; fix it and re-run.")

# Absolute path to uvx: Claude Desktop is a GUI app and won't see your shell PATH
config.setdefault("mcpServers", {})["blender"] = {
    "command": uvx_path,
    "args": ["blender-mcp"],
}

with open(config_file, "w") as f:
    json.dump(config, f, indent=2)

print(f"==> Registered 'blender' MCP server in {config_file}")
PY

cat <<'EOF'

==> Done! Remaining steps (inside Blender — see README.md for details):
    1. Edit > Preferences > Add-ons > (v) dropdown top-right > Install from Disk...
       and pick the addon.py in this folder; enable "Interface: Blender MCP"
    2. In the 3D viewport press N > BlenderMCP tab > Connect to Claude
    3. Fully quit and reopen Claude Desktop (look for the tools icon)
    4. Run blender_imperial_setup.py in Blender's Scripting tab, then
       File > Defaults > Save Startup File
EOF

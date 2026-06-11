# Blender MCP Setup — Claude ↔ Blender 5.1.2

Connects Claude to Blender through the [blender-mcp](https://github.com/ahujasid/blender-mcp)
connector so you can drive dimensionally-accurate modeling ("41'-0" x 39'-0" footprint,
9'-1 1/8" plate height") in natural language. Claude writes real `bpy` Python with your
literal numbers — no generative-mesh approximation.

**How the pieces connect:**

```
Claude Desktop ──(MCP)──> uvx blender-mcp ──(socket :9876)──> addon.py inside Blender
```

Your Blender 5.1.2 is fully supported (the addon requires Blender 3.0+).

---

## Quick start

**macOS / Linux** — open Terminal in this folder and run:

```bash
./setup.sh
```

**Windows** — open PowerShell in this folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

The script does three things:

1. Installs the **uv** package manager if missing (the MCP server runs via `uvx blender-mcp`)
2. Downloads the latest **`addon.py`** from the blender-mcp repo into this folder
3. Adds the `blender` entry to your **Claude Desktop config** (backs up the existing
   config first, and writes the *absolute* path to `uvx` to avoid the common
   `spawn uvx ENOENT` error)

Then finish with the manual steps below — these happen inside Blender and can't be scripted.

---

## Manual steps (5 minutes, inside Blender)

### 1. Install the addon in Blender 5.1.2

1. Open Blender → **Edit → Preferences → Add-ons**
2. Click the **dropdown arrow (v) in the top-right corner** → **Install from Disk…**
   *(in Blender 4.2+ the old "Install…" button lives in this dropdown)*
3. Select the `addon.py` file the setup script downloaded into this folder
4. Enable the checkbox for **"Interface: Blender MCP"**

### 2. Start the connection

1. In the 3D Viewport, press **N** to open the sidebar
2. Click the **BlenderMCP** tab
3. (Optional) check **Poly Haven** if you want Claude to pull real textures —
   brick, clapboard, shingles — for renders
4. Click **Connect to Claude**

### 3. Restart Claude Desktop

Fully quit and reopen Claude Desktop. You should see the tools (hammer) icon in the
chat input — that means the Blender MCP server is registered.

### 4. Set Blender to Imperial units

Blender defaults to meters; skip this and your 41-foot-wide house comes out 41 meters wide.

1. In Blender, switch to the **Scripting** workspace tab
2. Open `blender_imperial_setup.py` (in this folder) and click **Run Script** (▶)
3. **File → Defaults → Save Startup File** so every new file starts in feet/inches

The script sets Imperial units (feet), foot-aligned viewport grid, and extends the
viewport clip range so a full house doesn't get visually clipped.

### 5. Smoke test

In Claude Desktop, ask:

> Using Blender, create a cube exactly 41 feet wide, 39 feet deep, and 9 feet tall,
> sitting on the ground plane at the origin. Confirm the dimensions back to me.

If a correctly-sized box appears in Blender, you're live. Then use
`PROMPT_TEMPLATE.md` for the real massing-model spec.

---

## Optional: parametric architecture addons

- **Archimesh** (free, official) — parametric walls, doors, windows, stairs, roofs.
  Install inside Blender: **Edit → Preferences → Get Extensions** → search "Archimesh"
  → Install. Claude can drive it through MCP since it's all exposed via Python.
- **Archipack 2.x** (paid, Gumroad) — more capable, but **has known breakage on
  Blender 5.0/5.1** (registration and `bl_i18n_utils` errors reported on the
  [issue tracker](https://github.com/s-leger/archipack/issues/436)). Check that those
  issues are resolved before buying for 5.1.2, or run it in a Blender 4.5 LTS install.
- Raw `bpy` box-modeling (no addon) is perfectly fine for massing and elevation studies.

---

## Using Claude Code instead of Claude Desktop

If you'd rather drive Blender from the terminal:

```bash
claude mcp add blender -- uvx blender-mcp
```

⚠️ Run only **one** MCP client against Blender at a time (Desktop *or* Claude Code,
not both).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `spawn uvx ENOENT` in Claude Desktop | GUI apps don't inherit your terminal PATH. The setup script already writes the absolute `uvx` path; if you edited the config by hand, replace `"uvx"` with the output of `which uvx` (Mac/Linux) or `where uvx` (Windows). |
| First command times out | Known quirk — just retry; subsequent commands work. |
| Connection errors persist | Restart **both** Claude Desktop and Blender, then click **Connect to Claude** again in the N-panel. |
| Tools icon missing in Claude | Config file wasn't picked up — fully quit Claude Desktop (check the system tray), reopen, and verify the JSON is valid. |
| Conda/pyenv conflicts | Pin Python in the config: `"args": ["--python", "3.11", "blender-mcp"]` with `"env": {"UV_PYTHON_PREFERENCE": "only-managed"}`. |

**Security note:** the connector's `execute_blender_code` tool runs arbitrary Python
inside Blender. Save your .blend file before letting Claude run big operations, and
review what it's doing on anything destructive.

## Files in this folder

| File | Purpose |
|---|---|
| `setup.sh` / `setup.ps1` | One-shot installer (uv + addon download + Claude config) |
| `claude_desktop_config.snippet.json` | The config entry, if you prefer to edit by hand |
| `blender_imperial_setup.py` | Run inside Blender: Imperial units + architecture-friendly viewport |
| `PROMPT_TEMPLATE.md` | Spec-style prompt template for the Colonial Revival massing model |

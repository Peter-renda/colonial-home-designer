# Blender MCP setup for Windows.
# Installs uv, downloads the blender-mcp addon, and registers the MCP server
# in Claude Desktop's config. Safe to re-run; backs up your existing config.
#
# Run from this folder:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AddonUrl  = "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py"

Write-Host "==> Blender MCP setup"

# --- 1. uv -------------------------------------------------------------------
$uvx = Get-Command uvx -ErrorAction SilentlyContinue
if (-not $uvx) {
    Write-Host "==> Installing uv (provides the 'uvx' runner)..."
    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    # Fresh installs land in %USERPROFILE%\.local\bin; pick it up for this session
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
    $uvx = Get-Command uvx -ErrorAction SilentlyContinue
    if (-not $uvx) {
        throw "uv installed but 'uvx' not found on PATH. Open a NEW PowerShell window and re-run this script."
    }
}
$UvxPath = $uvx.Source
Write-Host "==> uvx found at: $UvxPath"

# --- 2. addon.py ---------------------------------------------------------------
Write-Host "==> Downloading addon.py from ahujasid/blender-mcp..."
Invoke-WebRequest -Uri $AddonUrl -OutFile (Join-Path $ScriptDir "addon.py")
Write-Host "==> Saved to $ScriptDir\addon.py"

# --- 3. Claude Desktop config --------------------------------------------------
$ConfigDir  = Join-Path $env:APPDATA "Claude"
$ConfigFile = Join-Path $ConfigDir "claude_desktop_config.json"
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null

if (Test-Path $ConfigFile) {
    $stamp = Get-Date -Format "yyyyMMddHHmmss"
    Copy-Item $ConfigFile "$ConfigFile.bak.$stamp"
    Write-Host "==> Backed up existing config"
    $config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
} else {
    $config = [PSCustomObject]@{}
}

if (-not ($config.PSObject.Properties.Name -contains "mcpServers")) {
    $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value ([PSCustomObject]@{})
}

# Windows GUI apps need the cmd /c wrapper + absolute uvx path to avoid spawn ENOENT
$blenderEntry = [PSCustomObject]@{
    command = "cmd"
    args    = @("/c", $UvxPath, "blender-mcp")
}
if ($config.mcpServers.PSObject.Properties.Name -contains "blender") {
    $config.mcpServers.blender = $blenderEntry
} else {
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name "blender" -Value $blenderEntry
}

$config | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigFile -Encoding UTF8
Write-Host "==> Registered 'blender' MCP server in $ConfigFile"

Write-Host @"

==> Done! Remaining steps (inside Blender -- see README.md for details):
    1. Edit > Preferences > Add-ons > (v) dropdown top-right > Install from Disk...
       and pick the addon.py in this folder; enable "Interface: Blender MCP"
    2. In the 3D viewport press N > BlenderMCP tab > Connect to Claude
    3. Fully quit Claude Desktop (check the system tray) and reopen it
    4. Run blender_imperial_setup.py in Blender's Scripting tab, then
       File > Defaults > Save Startup File
"@

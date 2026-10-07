# windbell-desktop Windows NSIS build
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\dist-win.ps1

$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path "..\windbell-web.js\dist\index.html")) {
  Write-Error "windbell-web dist not found; build windbell-web first"
  exit 1
}

if (-not (Test-Path "dist\main.mjs")) {
  Write-Error "windbell-desktop dist not found; build windbell-desktop first"
  exit 1
}

if (-not $env:ELECTRON_MIRROR) {
  $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
}

if (-not $env:ELECTRON_BUILDER_BINARIES_MIRROR) {
  $env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
}

npx.cmd electron-builder `
  --win nsis `
  --config electron-builder.yml `
  --publish never `
  @args

#!/usr/bin/env pwsh
#Requires -Version 7.3

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

Set-Location (Join-Path $PSScriptRoot '..')

& (Join-Path $PSScriptRoot 'check.ps1')

New-Item -ItemType Directory -Force dist | Out-Null

$esbuildArgs = @(
  'src/main.ts'
  '--bundle'
  '--platform=node'
  '--format=esm'
  '--target=node24'
  '--external:electron'
  '--outfile=dist/main.mjs'
)
npx.cmd esbuild @esbuildArgs

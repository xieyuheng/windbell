#!/usr/bin/env pwsh
#Requires -Version 7.3

[CmdletBinding()]
param(
  [Parameter(Mandatory, Position = 0)]
  [string]$Package,

  [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
  [string[]]$Tasks
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

# 进入 packages/<pkg>，依次运行其 scripts/<task>.ps1
# 用法：./scripts/run-in.ps1 <pkg> <task>...

$repoRoot   = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$packageDir = Join-Path $repoRoot "packages/$Package"

Push-Location $packageDir
try {
  foreach ($task in $Tasks) {
    $name = $task -replace '\.(sh|ps1)$', ''
    & (Join-Path $packageDir "scripts/$name.ps1")
  }
} finally {
  Pop-Location
}

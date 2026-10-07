#!/usr/bin/env pwsh
#Requires -Version 7.3

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

Set-Location (Join-Path $PSScriptRoot '..')

$databaseDir = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $databaseDir | Out-Null
$env:WINDBELL_DATABASE = $databaseDir

try {
  New-Item -ItemType Directory -Force snapshot | Out-Null

  $conversation = @(
    '--provider', 'mock'
    '--model', 'conversation'
    '--prompts', 'mock/prompts/conversation.md'
  )
  node src/main.ts batch @conversation > snapshot/conversation.out

  $toolErrors = @(
    '--provider', 'mock'
    '--model', 'tool-errors'
    '--prompts', 'mock/prompts/tool-errors.md'
  )
  node src/main.ts batch @toolErrors > snapshot/tool-errors.out

  $truncateOutput = @(
    '--provider', 'mock'
    '--model', 'truncate-output'
    '--prompts', 'mock/prompts/truncate-output.md'
    '--max-output-chars', '4'
  )
  node src/main.ts batch @truncateOutput > snapshot/truncate-output.out
} finally {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $databaseDir
}

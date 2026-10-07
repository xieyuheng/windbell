#!/usr/bin/env pwsh
#Requires -Version 7.3

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

Set-Location (Join-Path $PSScriptRoot '..')

$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'

npx.cmd electron .

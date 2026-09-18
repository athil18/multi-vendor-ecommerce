<#
.SYNOPSIS
  Nexus Local Dev - Windows Startup Automation Uninstaller
.DESCRIPTION
  Safely removes the automatic startup configuration and terminates running instances.
.GOVERNANCE
  @agent engineering-devops-automator
  @agent engineering-infrastructure-maintainer
#>

[CmdletBinding()]
param()

$startupFolder = [System.IO.Path]::Combine($env:APPDATA, "Microsoft\Windows\Start Menu\Programs\Startup")
$startupShortcut = Join-Path $startupFolder "NexusLocalDev.lnk"
$desktopFolder = [System.Environment]::GetFolderPath("Desktop")
$desktopShortcut = Join-Path $desktopFolder "Open Nexus E-Commerce.lnk"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$supervisorJs = Join-Path $scriptDir "dev-supervisor.js"

Write-Host "==============================================================" -ForegroundColor Yellow
Write-Host "  🛑 UNINSTALLING NEXUS LOCAL DEV STARTUP AUTOMATION" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Yellow

# 1. Remove Windows Startup shortcut
if (Test-Path $startupShortcut) {
    Remove-Item $startupShortcut -Force
    Write-Host "✅ Removed Windows Startup shortcut." -ForegroundColor Green
}

# 2. Remove Desktop shortcut
if (Test-Path $desktopShortcut) {
    Remove-Item $desktopShortcut -Force
    Write-Host "✅ Removed Desktop shortcut." -ForegroundColor Green
}

# 3. Unregister Scheduled Task
try {
    schtasks /Delete /TN "NexusLocalDev" /F 2>$null
    Write-Host "✅ Removed Windows Scheduled Task (if registered)." -ForegroundColor Green
} catch {}

# 4. Stop running supervisor
if (Test-Path $supervisorJs) {
    Write-Host "Stopping any running local supervisor processes..." -ForegroundColor Yellow
    node "$supervisorJs" stop
}

Write-Host "`n✅ Uninstallation complete. Auto-start is now disabled." -ForegroundColor Green
Write-Host "==============================================================`n" -ForegroundColor Yellow

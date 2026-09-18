# Nexus Local Dev - Windows Startup Automation Installer
# Governed by: engineering-devops-automator, engineering-infrastructure-maintainer, security-secrets-credential-engineer

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsLauncher = Join-Path $scriptDir "silent-launch.vbs"
$supervisorJs = Join-Path $scriptDir "dev-supervisor.js"
$startupFolder = [System.IO.Path]::Combine($env:APPDATA, "Microsoft\Windows\Start Menu\Programs\Startup")
$startupShortcut = Join-Path $startupFolder "NexusLocalDev.lnk"
$desktopFolder = [System.Environment]::GetFolderPath("Desktop")
$desktopShortcut = Join-Path $desktopFolder "Open Nexus E-Commerce.lnk"

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  NEXUS LOCAL DEV - WINDOWS STARTUP INSTALLATION" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

if (-not (Test-Path $vbsLauncher)) {
    Write-Host "Error: Could not find silent launcher: $vbsLauncher" -ForegroundColor Red
    exit 1
}

# 1. Configure Windows Startup Folder Shortcut
try {
    Write-Host "[1/2] Creating Windows Startup Folder entry..." -ForegroundColor Yellow
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($startupShortcut)
    $shortcut.TargetPath = "wscript.exe"
    $shortcut.Arguments = "`"$vbsLauncher`""
    $shortcut.WorkingDirectory = $scriptDir
    $shortcut.Description = "Nexus Local E-Commerce Background Development Supervisor"
    $shortcut.IconLocation = "shell32.dll,14"
    $shortcut.Save()
    Write-Host "      Windows Startup shortcut created: $startupShortcut" -ForegroundColor Green
} catch {
    Write-Host "      Failed to create Startup folder shortcut: $_" -ForegroundColor Yellow
}

# 2. Create Desktop Launcher Shortcut
try {
    Write-Host "[2/2] Creating Desktop Shortcut for instant browser launch..." -ForegroundColor Yellow
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($desktopShortcut)
    $shortcut.TargetPath = "node.exe"
    $shortcut.Arguments = "`"$supervisorJs`" open"
    $shortcut.WorkingDirectory = $scriptDir
    $shortcut.Description = "Launch Nexus E-Commerce in Browser (http://localhost:3000)"
    $shortcut.IconLocation = "shell32.dll,220"
    $shortcut.Save()
    Write-Host "      Desktop shortcut created: $desktopShortcut" -ForegroundColor Green
} catch {
    Write-Host "      Failed to create Desktop shortcut: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "Nexus E-Commerce will start automatically in the background whenever you log into Windows." -ForegroundColor White
Write-Host "Target URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Desktop shortcut created: Open Nexus E-Commerce" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

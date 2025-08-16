<# 
.SYNOPSIS
  Checks environment readiness for the Phishing Simulator project (Windows PowerShell).
#>

$ErrorActionPreference = "Stop"

function Write-Header($text) {
  Write-Host ""
  Write-Host "=== $text ===" -ForegroundColor Cyan
}

function Check-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Get-Version($name) {
  try {
    $ver = & $name -v 2>$null
    if (-not $ver) { $ver = & $name --version 2>$null }
    if (-not $ver) { return $null }
    return ($ver | Select-Object -First 1).ToString().Trim()
  } catch {
    return $null
  }
}

function Compare-Semver($v, $min) {
  # Returns $true if v >= min (rough semver compare)
  try {
    $a = $v -replace '[^\d\.]','' -split '\.'
    $b = $min -split '\.'
    for ($i=0; $i -lt 3; $i++) {
      $ai = [int]($a[$i] | ForEach-Object {if ($_ -eq $null -or $_ -eq '') {0} else {$_}})
      $bi = [int]$b[$i]
      if ($ai -gt $bi) { return $true }
      if ($ai -lt $bi) { return $false }
    }
    return $true
  } catch { return $false }
}

$ok = $true

Write-Host "`nPhishing Simulator - Environment Check (PowerShell)" -ForegroundColor Green

Write-Header "Node.js"
$nodeInstalled = Check-Command node
if (-not $nodeInstalled) {
  Write-Host "Node.js not found. Install LTS (v18+) from https://nodejs.org" -ForegroundColor Red
  $ok = $false
} else {
  $nodeVer = Get-Version node
  Write-Host "Node: $nodeVer"
  if (-not (Compare-Semver $nodeVer "18.0.0")) {
    Write-Host "Node.js must be >= 18.0.0" -ForegroundColor Yellow
  }
}

Write-Header "npm"
$npmInstalled = Check-Command npm
if (-not $npmInstalled) {
  Write-Host "npm not found (should come with Node.js)" -ForegroundColor Red
  $ok = $false
} else {
  $npmVer = Get-Version npm
  Write-Host "npm: $npmVer"
}

Write-Header "git (optional)"
$gitInstalled = Check-Command git
if ($gitInstalled) {
  $gitVer = Get-Version git
  Write-Host "git: $gitVer"
} else {
  Write-Host "git not found (optional). Download: https://git-scm.com" -ForegroundColor Yellow
}

Write-Header "Ports availability"
function Test-Port($port) {
  try {
    $used = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    return $null -ne $used
  } catch {
    return $false
  }
}
$port4000Used = Test-Port 4000
$port5173Used = Test-Port 5173
if ($port4000Used) { Write-Host "Port 4000 is in use. Server may fail to start." -ForegroundColor Yellow } else { Write-Host "Port 4000: free" }
if ($port5173Used) { Write-Host "Port 5173 is in use. Client may fail to start." -ForegroundColor Yellow } else { Write-Host "Port 5173: free" }

Write-Header "Conclusion"
if ($ok) {
  Write-Host "Environment looks OK. You can proceed with install steps." -ForegroundColor Green
} else {
  Write-Host "Please fix the errors above and run again." -ForegroundColor Red
}
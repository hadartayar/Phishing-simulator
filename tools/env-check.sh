#!/usr/bin/env bash
# Environment check for Phishing Simulator (macOS/Linux)

set -e

cyan() { printf "\033[36m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

header() { echo; cyan "=== $1 ==="; }

compare_semver() {
  # returns 0 if $1 >= $2
  local IFS=.
  local i ver1=($1) ver2=($2)
  for ((i=${#ver1[@]}; i<3; i++)); do ver1[i]=0; done
  for ((i=${#ver2[@]}; i<3; i++)); do ver2[i]=0; done
  for ((i=0; i<3; i++)); do
    if ((10#${ver1[i]} > 10#${ver2[i]})); then return 0; fi
    if ((10#${ver1[i]} < 10#${ver2[i]})); then return 1; fi
  done
  return 0
}

echo
green "Phishing Simulator - Environment Check (bash)"

ok=1

header "Node.js"
if command -v node >/dev/null 2>&1; then
  nodeVer=$(node -v | sed 's/^v//')
  echo "Node: $nodeVer"
  if ! compare_semver "$nodeVer" "18.0.0"; then
    yellow "Node.js should be >= 18.0.0 (LTS recommended)"
  fi
else
  red "Node.js not found. Install LTS (v18+) from https://nodejs.org"
  ok=0
fi

header "npm"
if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm -v)"
else
  red "npm not found (should come with Node.js)"
  ok=0
fi

header "git (optional)"
if command -v git >/dev/null 2>&1; then
  echo "git: $(git --version)"
else
  yellow "git not found (optional). Download: https://git-scm.com"
fi

header "Ports availability"
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    yellow "Port $port is in use."
  else
    echo "Port $port: free"
  fi
}
check_port 4000
check_port 5173

header "Conclusion"
if [ $ok -eq 1 ]; then
  green "Environment looks OK. You can proceed with install steps."
else
  red "Please fix the errors above and run again."
fi
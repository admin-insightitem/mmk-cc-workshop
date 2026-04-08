#!/bin/sh
# Environment checklist — read-only, no installs

echo "=== Environment Checklist ==="
echo "Hostname : $(hostname)"
echo "User     : $(whoami)"
echo "OS       : $(uname -sr)"
echo "CPU      : $(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo unknown) cores"
if command -v free >/dev/null 2>&1; then mem=$(free -h | awk '/Mem:/{print $2}')
else mem="$(( $(sysctl -n hw.memsize 2>/dev/null) / 1073741824 ))G"; fi
echo "Memory   : ${mem:-unknown}"
echo "Disk     : $(df -h / | awk 'NR==2{print $4 " free"}')"
echo "Git      : $(git --version 2>/dev/null || echo 'not found')"
echo "Python   : $(python3 --version 2>/dev/null || echo 'not found')"
echo "Node     : $(node --version 2>/dev/null || echo 'not found')"
echo "mmk      : $(mmk version 2>/dev/null || echo 'not installed')"
echo "Remote   : ${CLAUDE_CODE_REMOTE:-false}"
echo "=== Ready! ==="

exit 0

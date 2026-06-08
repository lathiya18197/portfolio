#!/usr/bin/env bash
#
# run.sh — serve the portfolio locally for development.
#
#   ./run.sh            # serve on the default port (8081)
#   ./run.sh 3000       # serve on a custom port
#   PORT=5000 ./run.sh  # …or via env var
#
# Stops cleanly on Ctrl-C. No dependencies beyond Python 3 (preferred)
# or any one of a few common static servers as a fallback.

set -euo pipefail

# Always run from the script's own directory, so it works from anywhere.
cd "$(dirname "$0")"

PORT="${1:-${PORT:-8081}}"
URL="http://localhost:${PORT}"

# --- Open the browser shortly after the server comes up -----------------
open_browser() {
  sleep 1
  if command -v open >/dev/null 2>&1; then        # macOS
    open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then   # Linux
    xdg-open "$URL"
  elif command -v start >/dev/null 2>&1; then       # Git Bash on Windows
    start "$URL"
  fi
}

echo "→ Serving portfolio at ${URL}"
echo "  Press Ctrl-C to stop."
echo

open_browser &

# --- Pick whatever static server is available ---------------------------
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" .
elif command -v php >/dev/null 2>&1; then
  exec php -S "localhost:${PORT}"
else
  echo "Error: need python3, python, npx, or php to serve files." >&2
  exit 1
fi

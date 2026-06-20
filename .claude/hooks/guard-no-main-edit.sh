#!/usr/bin/env bash
#
# guard-no-main-edit.sh — Claude-Code PreToolUse-Guard.
#
# Schützt den main/master-Branch vor versehentlichen Änderungen DURCH CLAUDE:
#   - Edit/Write/MultiEdit auf main/master  -> blockiert
#     (Ausnahme: reine Doku — Pfade unter docs/ sowie CLAUDE.md/ROADMAP.md/README.md)
#   - `git commit` auf main/master          -> blockiert
#
# Auf jedem anderen Branch tut der Guard nichts (Exit 0, früh).
# Blockieren = Exit-Code 2 (Claude Code zeigt die stderr-Meldung und bricht den Call ab).
#
# Hinweis Git-Rollenteilung: Pushen/Pullen/Mergen macht ausschließlich der Mensch
# (separater Guard guard-no-push-pull.sh). Siehe CLAUDE.md.

set -euo pipefail

block() {
  echo "🚫 $1" >&2
  echo "   → Verbindliche Arbeitsweise Schritt 1: erst einen Branch erstellen (feat/… | fix/… | chore/…), dann arbeiten." >&2
  exit 2
}

# 1) Branch bestimmen — braucht KEIN jq. Nur auf main/master geht es weiter.
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
case "$branch" in
  main | master) ;;
  *) exit 0 ;;
esac

# 2) Hook-Input (JSON) von stdin lesen und mit jq auswerten.
input="$(cat)"
if ! command -v jq >/dev/null 2>&1; then
  # jq fehlt: fail-closed auf main ist sicher (auf Feature-Branches sind wir hier gar nicht).
  block "main-Guard: 'jq' nicht gefunden — Schreibzugriff auf '$branch' vorsorglich blockiert. Bitte 'jq' installieren oder Branch wechseln."
fi

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty')"

# 3a) Bash: nur `git commit` auf main blockieren.
if [ "$tool" = "Bash" ]; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
  if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]])git[[:space:]]+commit([^[:alnum:]]|$)'; then
    block "git commit auf '$branch' ist gesperrt — Commits gehören auf einen Feature-Branch."
  fi
  exit 0
fi

# 3b) Edit / Write / MultiEdit: Schreibzugriff blockieren, außer reine Doku.
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"

case "$file" in
  */docs/* | docs/*) exit 0 ;;
esac
case "$(basename "$file")" in
  CLAUDE.md | ROADMAP.md | README.md) exit 0 ;;
esac

block "Schreibzugriff auf '${file:-?}' ist auf '$branch' gesperrt."

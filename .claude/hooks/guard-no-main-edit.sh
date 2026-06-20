#!/usr/bin/env bash
#
# guard-no-main-edit.sh — Claude-Code PreToolUse-Guard.
#
# Schützt den main/master-Branch vor versehentlicher NORMALER Entwicklung DURCH CLAUDE:
#   - Edit/Write/MultiEdit auf main/master       -> blockiert
#     (Ausnahme: reine Doku — Pfade unter docs/ sowie CLAUDE.md/ROADMAP.md/README.md)
#   - normaler `git commit` auf main/master       -> blockiert
#
# ERLAUBT auf main (Git-Rollenteilung: Merges nach main macht Claude lokal):
#   - `git merge …` (Branch in main mergen; enthält kein `commit`, fällt durch)
#   - `git commit`, der einen LAUFENDEN Merge abschließt (MERGE_HEAD existiert,
#     z. B. Merge-Commit nach Konfliktauflösung)
#
# Auf jedem anderen Branch tut der Guard nichts (Exit 0, früh).
# Blockieren = Exit-Code 2 (Claude Code zeigt die stderr-Meldung und bricht den Call ab).
#
# Hinweis Git-Rollenteilung: Pushen/Pullen/Fetchen macht ausschließlich der Mensch
# (separater Guard guard-no-push-pull.sh). Merges nach main macht Claude. Siehe CLAUDE.md.

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

# 3a) Bash: nur NORMALEN `git commit` auf main blockieren.
#     `git merge` enthält kein `commit` und fällt durch (erlaubt — Claude merged nach main).
if [ "$tool" = "Bash" ]; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
  if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]])git[[:space:]]+commit([^[:alnum:]]|$)'; then
    # Ausnahme: Abschluss eines laufenden Merges (Merge-Commit) ist erlaubt.
    git_dir="$(git rev-parse --git-dir 2>/dev/null || echo ".git")"
    if [ -f "$git_dir/MERGE_HEAD" ]; then
      exit 0
    fi
    block "git commit auf '$branch' ist gesperrt — normale Commits gehören auf einen Feature-Branch (Merge-Commits sind erlaubt)."
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

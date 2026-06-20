#!/usr/bin/env bash
#
# guard-no-push-pull.sh — Claude-Code PreToolUse-Guard (Bash).
#
# Git-Rollenteilung (CLAUDE.md): `git push` / `git pull` / `git fetch` macht
# AUSSCHLIESSLICH der Mensch — auf JEDEM Branch. Claude bleibt rein lokal:
# Branch anlegen, committen, Tests fahren. Dieser Guard blockt die drei Befehle.
#
# Geprüft wird das echte git-SUBCOMMAND (erstes Nicht-Options-Token nach `git`),
# damit z. B. `git commit -m "fix push bug"` NICHT fälschlich blockiert wird.
# Verkettete Befehle (&&, ||, ;, |) werden einzeln untersucht.
#
# Blockieren = Exit-Code 2 (stderr-Meldung wird angezeigt, Call abgebrochen).

set -uo pipefail

input="$(cat)"

if ! command -v jq >/dev/null 2>&1; then
  # jq fehlt: Befehl nicht sicher prüfbar -> vorsorglich blockieren (fail-closed).
  echo "🚫 push/pull-Guard: 'jq' nicht gefunden — git-Netzbefehl vorsorglich blockiert. Bitte 'jq' installieren." >&2
  exit 2
fi

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"

# Liefert 0 (= blockieren), wenn ein git-Subcommand push/pull/fetch ist.
contains_blocked_git() {
  local line="$1"
  # Verkettungs-Operatoren in Zeilenumbrüche wandeln, dann Segment für Segment prüfen.
  line="${line//&&/$'\n'}"
  line="${line//||/$'\n'}"
  line="${line//;/$'\n'}"
  line="${line//|/$'\n'}"

  local segment
  while IFS= read -r segment; do
    # shellcheck disable=SC2206
    local toks=($segment) # Whitespace-Split reicht für die Subcommand-Erkennung
    local n=${#toks[@]} i=0
    while [ "$i" -lt "$n" ]; do
      if [ "${toks[$i]}" = "git" ]; then
        local j=$((i + 1))
        # Globale Optionen vor dem Subcommand überspringen.
        while [ "$j" -lt "$n" ]; do
          case "${toks[$j]}" in
            -C | -c | --git-dir | --work-tree | --namespace | --exec-path)
              j=$((j + 2)) # Option MIT Argument
              ;;
            -*)
              j=$((j + 1)) # einfaches Flag
              ;;
            *)
              break # erstes Nicht-Options-Token = Subcommand
              ;;
          esac
        done
        if [ "$j" -lt "$n" ]; then
          case "${toks[$j]}" in
            push | pull | fetch) return 0 ;;
          esac
        fi
      fi
      i=$((i + 1))
    done
  done <<<"$line"
  return 1
}

if contains_blocked_git "$cmd"; then
  echo "🚫 git push/pull/fetch macht ausschließlich der Mensch — Claude bleibt rein lokal (Branch + Commit + Tests)." >&2
  echo "   → Übergib einen fertigen, grünen Branch; den Push/Merge nach main erledigt der Mensch." >&2
  exit 2
fi

exit 0

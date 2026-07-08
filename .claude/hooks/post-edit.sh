#!/usr/bin/env bash
set -euo pipefail
# [F4] TS 파일 수정 직후: prettier 자동 적용 + tsc 타입체크 (Layer 1 보강의 즉시 피드백)
# exit 1 = 비차단 경고(Claude에게 피드백). 중간 상태의 타입 오류는 정상 과정일 수 있어 차단하지 않는다.

command -v jq >/dev/null 2>&1 || exit 0
changed="$(cat | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"
repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

case "$changed" in
  *.ts|*.tsx)
    ws=""
    case "$changed" in
      *"/backend/"*)  ws="backend"  ;;
      *"/frontend/"*) ws="frontend" ;;
    esac
    [ -z "$ws" ] && exit 0
    wsdir="$repo_root/$ws"
    if [ ! -d "$wsdir/node_modules" ]; then
      echo "[hook][F4] $ws 의존성 미설치 — npm install 후 타입체크가 활성화된다" >&2
      exit 0
    fi
    (cd "$wsdir" && npx prettier --write "$changed" >/dev/null 2>&1) || true
    if ! (cd "$wsdir" && npx tsc --noEmit >/tmp/tsc-err 2>&1); then
      echo "[hook][F4/Layer1] tsc 타입 오류 — 다음 작업 전에 해결하라:" >&2
      tail -20 /tmp/tsc-err >&2
      exit 1
    fi
    ;;
esac
exit 0

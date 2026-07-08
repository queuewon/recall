#!/usr/bin/env bash
set -euo pipefail
# [F3] repo 경계·민감 자원 가드 / [F-P1] API 키·셸 프로필 보호 / [F-P2] 하네스·프롬프트 수정 경고
# 표면: Read|Edit|Write|MultiEdit|Bash (실측 사고 ① 교훈 — Bash 포함, 도구 표면 전체 커버)

# 결정론 장치의 자가 점검 — jq 없으면 가드가 무력화되므로 fail-closed
command -v jq >/dev/null 2>&1 || { echo "[hook] jq 미설치 — 가드 무력화 방지 위해 차단. jq 설치 후 재시도." >&2; exit 2; }

input="$(cat)"
repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

targets="$(echo "$input" | jq -r '
  [.tool_input.file_path, .tool_input.path, .tool_input.notebook_path] |
  map(select(. != null)) | .[]' 2>/dev/null || true)"
cmd="$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"

# 1) 파일 경로: repo 루트 하위가 아니면 차단 (repo-루트 기준 — 실측 사고 ② 문자열 과차단 회피)
for p in $targets; do
  abs="$(realpath -m "$p" 2>/dev/null || echo "$p")"
  case "$abs" in
    "$repo_root"|"$repo_root"/*) : ;;
    *) echo "[hook][F3] repo 밖 경로 차단: $abs" >&2; exit 2 ;;
  esac
done

# 2) .env 차단 (.env.example 은 허용 — 유일한 예외)
for p in $targets; do
  base="$(basename "$p")"
  case "$base" in
    .env.example) : ;;
    .env|.env.*) echo "[hook][F3/F-P1] .env 접근 차단 (허용 예외: .env.example)" >&2; exit 2 ;;
  esac
done
if echo "$cmd" | grep -q '\.env' && ! echo "$cmd" | grep -q '\.env\.example'; then
  echo "[hook][F3/F-P1] 명령 내 .env 접근 차단" >&2; exit 2
fi

# 3) 기타 민감 패턴 (경로 + 명령 전체 표면)
combined="$targets $cmd"
if echo "$combined" | grep -Eq '\.ssh|id_rsa|id_ed25519|/etc/passwd|credentials|\.aws/'; then
  echo "[hook][F3] 민감 자원(키·자격증명) 접근 차단" >&2; exit 2
fi

# 4) [F-P1] 셸 프로필 수정·API 키 export 차단 (이중과금 함정 + 지속 오염 방지)
if echo "$cmd" | grep -Eq '\.zshrc|\.bashrc|\.bash_profile|(^|[^A-Za-z])\.profile([^A-Za-z]|$)|export +ANTHROPIC_API_KEY'; then
  echo "[hook][F-P1] 셸 프로필 수정 / API 키 export 차단 — 키는 repo 루트 .env 에만 둔다" >&2; exit 2
fi

# 5) Bash로 repo 밖을 겨냥한 파괴·복사 명령 차단 (보수적 최소 목록 — 정적 분석의 한계는 permission ask + 사람 눈이 보완)
if echo "$cmd" | grep -Eq '(^|[;&|]\s*)(rm|mv|cp|tee|dd)\s+.*(\.\./|~/|/Users/|/home/)'; then
  echo "[hook][F3] repo 밖을 겨냥한 셸 명령 차단: $cmd" >&2; exit 2
fi

# 6) [F-P2] 하네스·프롬프트 파일 수정 → 비차단 경고 (조건부 위임 — 절대 차단하면 과차단 사고 ② 변형)
for p in $targets; do
  case "$p" in
    *"/.claude/"*|*"/prompts/"*|prompts/*|*/CLAUDE.md|CLAUDE.md)
      echo "[hook][F-P2] 하네스/프롬프트 파일 수정 감지 — 조건부 위임 대상." >&2
      echo "[hook] 계획 승인 없이는 수정 금지. 수정 시 docs/decisions.md 에 한 줄 기록하라." >&2
      exit 1 ;;
  esac
done

exit 0

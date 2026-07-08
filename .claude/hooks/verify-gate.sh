#!/usr/bin/env bash
set -euo pipefail
# [F2] Stop 시점 검증 게이트 + [⑨] 테스트 게이밍 감지
# 상태 기계 (실측 사고 ③ 데드락 회피 — 게이트는 상태를 안다):
#   S0 코드 무변경 턴(계획·질문·문서)      → 통과
#   S1 테스트 개수 감소(vs HEAD)          → 차단 (게이밍 의심 — 정당하면 승인 요구)
#   S2 코드 변경 + 테스트 실실행 PASS      → 통과
#   S3 코드 변경 + FAIL / 의존성 미설치    → 차단
# 판정은 상태 파일이 아니라 실실행 — 위조 표면 제거 (가이드 §6-C 원칙)

repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$repo_root"

# 커밋이 하나도 없으면(부트스트랩 직후) 게이트 해당 없음 — README 절차상 초기 커밋으로 즉시 봉합됨
git rev-parse HEAD >/dev/null 2>&1 || exit 0

has_changes () {
  local p="$1"
  [ -d "$p" ] || return 1
  if ! git diff --quiet HEAD -- "$p" 2>/dev/null; then return 0; fi
  if [ -n "$(git ls-files --others --exclude-standard -- "$p" 2>/dev/null)" ]; then return 0; fi
  return 1
}

be=0; fe=0
if has_changes "backend";  then be=1; fi
if has_changes "frontend"; then fe=1; fi
if [ "$be" -eq 0 ] && [ "$fe" -eq 0 ]; then exit 0; fi   # S0

# S1: 게이밍 감지 — it(/test( 카운트가 HEAD 대비 감소했는가 (턴 단위 감지)
base_count="$(git grep -Eh '^[[:space:]]*(it|test)\(' HEAD -- '*.test.ts' '*.test.tsx' '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ' || true)"
head_count="$(grep -rEh --include='*.test.ts' --include='*.test.tsx' --include='*.spec.ts' '^[[:space:]]*(it|test)\(' backend frontend 2>/dev/null | wc -l | tr -d ' ' || true)"
skip_count="$(grep -rEh --include='*.test.ts' --include='*.test.tsx' --include='*.spec.ts' '(it|test|describe)\.skip\(|xit\(|xdescribe\(' backend frontend 2>/dev/null | wc -l | tr -d ' ' || true)"
if [ "${head_count:-0}" -lt "${base_count:-0}" ]; then
  echo "[hook][⑨게이밍] 테스트 개수 감소 감지 (${base_count} → ${head_count})." >&2
  echo "[hook] 삭제가 정당하다면 이유를 응답에 명시하고 사용자 승인을 받아라." >&2
  exit 2
fi
if [ "${skip_count:-0}" -gt 0 ]; then
  echo "[hook][⑨게이밍] skip/xit 침묵 테스트 ${skip_count}건 감지 — 침묵으로 통과를 만들지 마라." >&2
  exit 2
fi

# S2/S3: 변경된 워크스페이스만 테스트 실실행 (--passWithNoTests: 스캐폴딩 턴 데드락 방지)
run_ws () {
  local ws="$1"
  [ -f "$ws/package.json" ] || return 0
  if [ ! -d "$ws/node_modules" ]; then
    echo "[hook][F2] $ws 코드가 변경됐으나 의존성 미설치 — npm install 후 테스트를 통과시켜라." >&2
    return 1
  fi
  if ! (cd "$ws" && npx vitest run --passWithNoTests >/tmp/vitest-$ws-out 2>&1); then
    echo "[hook][F2] $ws 테스트 미통과 — 완료 선언 금지." >&2
    echo "[hook] 실패한 요구사항을 먼저 설명한 뒤, 관련 모듈만 수정하라. 테스트 자체를 고치지 마라." >&2
    tail -25 "/tmp/vitest-$ws-out" >&2
    return 1
  fi
  return 0
}

fail=0
if [ "$be" -eq 1 ]; then run_ws backend  || fail=1; fi
if [ "$fe" -eq 1 ]; then run_ws frontend || fail=1; fi
[ "$fail" -eq 1 ] && exit 2
exit 0

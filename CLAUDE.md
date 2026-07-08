# CLAUDE.md — recall-lab

## What this is
학습자가 직접 정리한 노트를 근거로 AI가 문제를 출제·채점하고 토론 상대가 되어주는 웹앱(PWA).
backend/ = Node + TypeScript + Hono, frontend/ = React + Vite + TS, DB = SQLite(Drizzle).

핵심 도메인 개념: Note(+NoteSource: InAppMemo | Notion), Question(유형별 판별 유니온),
Answer, Feedback, QuestionPolicy / GradingPolicy / DebatePolicy, LlmClient(인터페이스)

## Commands
- Typecheck: `cd backend && npx tsc --noEmit` (frontend 동일)
- Test: `cd backend && npx vitest run` (frontend 동일)
- Lint: `cd backend && npx eslint .` (frontend 동일)
- Format: `npx prettier --write <file>`
- Install: `npm install <pkg>` — settings.json allow에 미포함(의도적). 매번 ask가 뜬다.
  같은 승인을 3회 이상 기계적으로 누르게 되면 그 패키지명을 allow로 옮기는 걸 고려한다(승인 피로 관리).

## Workflow
- 새 기능/수정은 반드시 계획부터: plan-and-review 스킬을 먼저 사용한다.
- 테스트를 먼저 쓰고(red), 같은 턴에서 구현으로 통과시킨다(green).
- 완료 주장 전에 vitest가 통과해야 한다. 통과 없이 "완료"라고 말하지 않는다.
- 설계 결정을 내리면 docs/decisions.md에 한 줄 추가한다.

## Code rules
- tsconfig strict 전제. `any` / `as any` / `@ts-ignore` 금지 (불가피하면 이유 주석 + 승인).
- 도메인 값은 원시 타입 노출 금지 — branded type으로 감싼다 (예: NoteId, Score).
- 모든 신뢰 경계(HTTP 입력, LLM 응답, DB 읽기)는 zod 스키마로 파싱한다. 파싱 실패 = 거부.
- 오류를 빈 catch로 삼키지 않는다. 실패는 반환 타입으로 드러내거나 명시적으로 전파한다.
- 정책(출제·채점·토론 규칙)은 policy/에 인터페이스 뒤로 분리한다. service/는 조합만 한다.
- LLM 호출은 반드시 infra/의 LlmClient 인터페이스를 경유한다.
- 프롬프트 템플릿은 backend/prompts/ 에만 둔다. 수정은 계획 승인 후에만, 수정 시 decisions.md 기록.
- 새 의존성(npm 패키지) 추가 전에 반드시 이유를 말하고 승인을 받는다.
- 기능 4~5(기사 분석·토론)의 진입은 service/의 단일 경유점을 지나게 유지한다 (추후 결제 게이트 자리).

## Never
- backend/ frontend/ docs/ .claude/ 밖, 그리고 repo 밖 파일 수정 금지.
- .env·자격 증명·시크릿을 읽거나 코드에 하드코딩하지 않는다. 셸 프로필(.zshrc 등) 수정 금지.
- 테스트를 삭제하거나 it.skip / xit / describe.skip 으로 침묵시켜 통과를 만들지 않는다.
- 테스트에서 실 LLM·외부 API를 호출하지 않는다 — FakeLlmClient만 사용한다.
- Non-goal 침범 금지: 메모 에디터 고도화(위지윅·이미지·폴더 트리), 계정/인증(현 단계),
  소셜·공유·랭킹, 토론 총평에서 "어느 쪽이 정답이다" 발화.
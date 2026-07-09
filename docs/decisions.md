# Design Decisions — recall-lab

형식: 날짜 | 결정 | 이유 한 문장. 한 결정 = 한 줄. Claude와 석 달 뒤의 나에게 주는 가장 싼 컨텍스트.

2026-07-07 | 스택을 TS 풀스택(Node+Hono / React+Vite / SQLite+Drizzle)으로 확정 | 단일 언어 = 단일 검증 체인으로 하네스 단순화, Rust 초안은 가이드 정합용이었음을 재판정으로 정정
2026-07-07 | 플랫폼은 웹앱(PWA), 스토어 입점은 후속 트랙 | 모든 핵심 기능이 LLM 호출이라 오프라인 불가 — 네이티브 이점 소거, 폰 사용은 PWA로 충족
2026-07-07 | Layer 1 보강 3종: strict tsconfig + 신뢰 경계 zod 파싱 + branded type | Rust 타입 위임을 떠난 대가에 대한 가이드 부록 A 처방
2026-07-07 | LLM 호출은 LlmClient 인터페이스 경유, 테스트는 FakeLlmClient만 | F-P1: API 비용 폭주·비결정 테스트를 구조로 차단
2026-07-07 | 프롬프트 템플릿은 backend/prompts/ 로 분리, 수정은 조건부 위임(승인+기록) | F-P2: 프롬프트 회귀는 코드 diff에서 눈에 안 띔
2026-07-07 | ANTHROPIC_API_KEY는 repo 루트 .env 단일 위치, 셸 프로필 export 금지 | Claude Code가 구독 대신 API로 과금되는 이중과금 함정 회피
2026-07-07 | 기능 4~5(기사 분석·토론)는 service 단일 경유점을 지나게 유지 | 추후 결제 게이트 삽입 자리 확보 — 플래그 시스템은 만들지 않음(과잉설계 금지)
2026-07-07 | 결제(F-P4)·타인 공개(F-P5) 통제는 조건부 승급 항목으로 등록만 | 마찰 근거 증설 — 이번 달 겪을 실패가 아님
2026-07-07 | 사용자 노트는 프롬프트 조립 시 명시적 데이터 블록으로 감싼다(명령부/데이터부 분리) | 비용 0인 인젝션 대비 습관 — 체계적 방어는 타인 공개 시점의 일
2026-07-07 | 노트 저작권은 사용자 소유, 서비스는 처리 라이선스만·학습 데이터 미사용 원칙 | 약관 실물은 공개 전 작업, 원칙만 선기록
2026-07-08 | verify-gate.sh에 `|| true` 추가 (게이밍 감지 카운트 파이프라인 3곳) | frontend/ 부재 시 pipefail로 침묵 사망하던 버그를 실행 검증 중 발견 — 하네스도 코드이므로 실행 검증 대상
2026-07-08 | settings.json permission deny에 `Read(./.env.*)` 추가 | hook은 처음부터 .env.* 차단이었는데 permission 레이어만 .env 단일 파일만 막던 이중방어 불일치 발견·보완
2026-07-08 | npm workspaces 모노레포(backend/frontend) 스캐폴드, SQLite 드라이버는 better-sqlite3(^12.11.1) | node:sqlite는 실험적, @libsql/client는 로컬 단일 파일 용도엔 배꼽(원격 DB향 기능多); better-sqlite3 11.x는 Node 26 네이티브 빌드 실패(V8 PropertyCallbackInfo API 변경)로 12.x 상향 필요했음
2026-07-08 | PWA는 manifest.json만 포함, 서비스워커/vite-plugin-pwa는 범위 밖 | 요청 범위(설치 가능성)만 충족, 오프라인 캐싱은 핵심 기능이 전부 LLM 호출이라 의미 없음 — 새 의존성도 아낌
2026-07-08 | backend에 @hono/node-server 추가(계획에 없던 의존성, 승인받음) | Hono 코어는 런타임 비종속이라 Node http 서버로 띄우려면 공식 어댑터 필수
2026-07-08 | 개발 머신 Node를 Homebrew로 신규 설치(v26, Current 라인) | 이전엔 Node 자체가 없었음; 이후 네이티브 애드온(better-sqlite3 등) 추가 시 prebuilt 바이너리 유무를 먼저 확인할 것
2026-07-09 | domain/ 핵심 타입(Note/Concept/Question/Answer/Feedback) 전부 branded+zod 쌍으로 정의, createdAt/updatedAt은 브랜드 안 함 | ID·Score는 불변식 있는 도메인 값이라 브랜드, 타임스탬프는 기술적 값이라 원시 Date 유지
2026-07-09 | NoteSchema에 updatedAt >= createdAt refine 추가 | 과잉설계가 아니라 실제 도메인 불변식이라는 판단(사용자 확정)
2026-07-09 | Feedback에 answerId 필드 추가(원 요청엔 없었음) | 참조 없이는 어떤 답변에 대한 채점인지 알 수 없어 실사용 불가
2026-07-09 | Answer.content는 현재 min(1)로 빈 문자열 차단, "미제출" 상태는 아직 모델링 안 함 | 빈 문자열이 미제출/모름 중 무엇을 뜻할지 미확정 — 필요해지면(P1-5~P1-7) Answer에 별도 status 필드로 재결정
2026-07-09 | Question 유형별 필드·Feedback.issues는 단일 테이블 + JSON 직렬화로 저장(questions/answers/feedbacks 테이블은 정의만, Repository는 미구현) | 이번 규모엔 정규화보다 단순 구현이 적합, QuestionRepository 등은 필요해질 때 추가
2026-07-09 | NoteRepository의 create/update 입구에도 NoteSchema.parse()를 한 번 더 통과시킨다 | "신뢰 경계"는 읽기/쓰기 방향이 아니라 코드 밖 데이터가 들어오는 지점 전부를 의미한다는 재정의 — 비용이 작아 지금부터 습관화(향후 모든 Repository에 동일 적용)
2026-07-09 | DB 마이그레이션은 drizzle-kit generate로 생성한 SQL을 drizzle-orm 마이그레이터로 적용, .env는 Node 내장 --env-file-if-exists 플래그로 로드(새 의존성 없음) | dotenv 패키지 없이 Node 20.6+/26 내장 기능으로 충분, 파일 부재 시에도 죽지 않게 if-exists 사용
2026-07-09 | Note CRUD API: createApp이 { noteService }를 주입받는 구조로 변경, 에러 응답은 { error: string } 단순 문자열, PATCH는 부분 patch를 service가 기존 값과 병합 | 라우트를 실제 DB 없이 fake NoteService로 테스트하기 위한 DI, 이번 규모엔 구조화된 에러 바디가 과함
2026-07-09 | 프론트는 백엔드 도메인 스키마를 공유하지 않고 frontend/src/api/note.ts에 자체 zod 스키마를 중복 정의 | 워크스페이스 독립 배포 가능성 우선, 공유 패키지는 이번 기능 규모에 과함
2026-07-09 | 프론트에 라우터를 도입하지 않고 App의 컴포넌트 상태로 목록/편집 화면을 전환 | 화면 2개뿐이라 새 의존성 불필요 — 화면이 늘어나면(P1-5 이후) 라우터(react-router 등) 재도입을 그때 다시 고려한다
2026-07-09 | 마크다운 미리보기는 react-markdown 채택, dangerouslySetInnerHTML 미사용으로 XSS를 구조적으로 차단(테스트로 실제 검증함) | marked+dompurify 대비 의존성 1개 적고 sanitize 단계를 직접 관리할 필요 없음
2026-07-09 | Vite dev 서버에 /notes, /health 프록시 추가로 CORS 우회(백엔드 CORS 미들웨어 미도입) | 개발 편의, 배포 시 CORS/리버스프록시 구성은 이번 범위 밖
2026-07-09 | AnthropicLlmClient는 messages.parse()+zodOutputFormat 대신 tools+tool_choice 기반으로 구조화 출력을 받는다 | SDK의 zodOutputFormat이 zod v4 클래스 계층을 요구해 우리 v3 classic 스키마와 비호환임을 실측 확인(프로브 스크립트로 tsc 에러 재현)
2026-07-09 | zod를 3.24.1 → 3.25.76으로 올림 | SDK peer dependency(`^3.25.0 \|\| ^4.0.0`) 충족 목적, 도메인 코드는 classic v3 문법 그대로 — vitest 전체 통과로 영향 없음 확인
2026-07-09 | toolInputSchema(수기 JSON Schema)와 responseSchema(zod)는 이중 정의 — 드리프트 위험 있음 | 템플릿 2개뿐이라 zod-to-json-schema 같은 자동 변환 라이브러리 도입은 보류, 템플릿이 늘어나면 재검토. 대신 키 목록 일치 테스트로 드리프트를 잡는다
2026-07-09 | 기능1(개념 암기 문제): ShortAnswerQuestionSchema에 optional conceptId 추가 | 단답형 채점 시 "어느 개념을 기준으로 삼을지" 필요 — questions.concept_id 컬럼이 이미 있어 마이그레이션 불필요
2026-07-09 | 기능1: grade-answer-demo(플레이스홀더)를 grade-short-answer(실제 기능)로 교체(삭제+신규) | 데모는 LlmClient 구조 검증용이었고 이번에 실제 GradingPolicy가 그 자리를 대체
2026-07-09 | 기능1: QuestionPolicy/GradingPolicy는 구현이 각각 1개뿐이어도 인터페이스 뒤로 유지한다 | CLAUDE.md가 "출제·채점 규칙은 policy/에 인터페이스로 분리"를 프로젝트 원칙으로 명시함 — "단일 구현이면 인터페이스 강등" 일반 가이드의 명시적 예외로 판단
2026-07-09 | 기능1: MultipleChoice 채점에서 "숫자가 아니거나 범위 밖인 답변"은 오답(score 0)이 아니라 malformed_answer라는 별도 에러로 구분 | 형식이 잘못된 답과 정상 제출했지만 틀린 답은 다른 실패 상태 — 하나로 뭉치면 클라이언트가 원인을 구분할 수 없음
2026-07-09 | 기능1: 개념 추출 결과에 상한을 두지 않되 20개 초과 시 console.warn으로 관찰 | 상한을 지금 확정하기엔 이르지만, 폭주 신호는 지금부터 눈에 띄게 남겨둔다
2026-07-09 | 기능1: FakeLlmClient가 고정 응답 외에 템플릿별 분기 함수(`(template) => LlmResult`)도 받을 수 있도록 확장 | questionGenerationService가 한 요청 안에서 서로 다른 응답 스키마(개념 추출→문제 생성)를 여러 번 호출해야 해서 고정 응답 하나로는 테스트 불가능해짐. 기존 고정값 생성자는 하위 호환 유지
2026-07-09 | 기능2(개념 서술 문제): EssayQuestionSchema에 optional conceptId 추가 | ShortAnswer와 동일한 이유 — 서술형 채점 시 "어느 개념을 기준으로 삼을지" 필요, questions.concept_id 컬럼 재사용
2026-07-09 | 기능2: generate-essay/grade-essay 템플릿이 generate-short-answer/grade-short-answer의 응답 zod 스키마를 그대로 import해 재사용(재정의 안 함) | 결합 사실 — ShortAnswer와 Essay는 생성·채점 응답 모양이 완전히 같아 스키마를 공유한다. 둘 중 하나만 응답 형식(필드 추가 등)을 바꾸려면 먼저 이 결합을 풀고 스키마를 분리해야 한다. 그전까지는 한쪽 스키마 변경이 곧 다른 쪽에도 영향을 미침을 인지하고 작업할 것
2026-07-09 | 기능2: QuestionPolicy 기존 테스트("alternates ... MultipleChoice/ShortAnswer")를 3-way 회전 검증으로 갱신 | 삭제가 아니라 유형이 2종→3종(Essay 추가)으로 늘어난 스펙 변경에 따른 정당한 갱신 — 커밋 메시지에도 동일하게 명시
2026-07-09 | 기능3(능동 회상 문제): ActiveRecallQuestionSchema.conceptId(단수)를 conceptIds(복수, min 2)로 breaking change | questionGenerationService/answerService/기존 테스트 전체를 grep으로 재확인한 결과 실사용이 전혀 없었음(feature 1·2 스캐폴딩 단계의 placeholder 필드) — 하위호환을 지킬 실질적 이유가 없어 의도적으로 지키지 않음
2026-07-09 | 기능3: GradingPolicy.grade의 세 번째 인자를 `concept: Concept \| null` → `concepts: Concept[]`로 일반화, 별도 policy 신설 안 함 | ShortAnswer/Essay(개념 0~1개)와 ActiveRecall(개념 2개 이상)이 채점 흐름·응답 스키마({score,issues,comment})를 그대로 공유할 수 있어 실제 중복이 있는 곳에서만 확장 — 단, `!concept`(falsy 체크)를 그대로 배열에 옮기면 빈 배열이 truthy라 missing_concept 가드가 무력화되는 함정이 있어 `concepts.length === 0`/`< 2` 명시적 길이 체크로 구현
2026-07-09 | 기능3: infra/llm/conceptListFormat.ts의 formatConceptList를 GradingPolicy(채점)와 questionGenerationService(생성)가 공유 | 개념 목록을 "0. term: explanation" 형식으로 프롬프트에 넣는 로직이 두 곳에서 동일하게 필요해진 실제 중복 사례 — 재사용 원칙에 따라 추출
2026-07-09 | 기능3: QuestionPolicy.plan은 ActiveRecall을 회전(rotation) 슬롯을 대체하지 않고 개념 3개 이상일 때 추가 항목으로 덧붙이며, 후보 풀은 최대 5개로 제한 | 회전 슬롯을 뺏으면 MC/SA/Essay 노출 빈도가 줄어드는 부작용 발생 — 어떤 개념들이 실제로 연결되는지는 정책이 아니라 생성 시점 LLM이 usedConceptIndexes로 고르므로, 정책은 후보 풀만 넘긴다
2026-07-10 | MVP 마감: 2026-07-08 "서비스워커/vite-plugin-pwa는 범위 밖" 결정을 뒤집고 손수 작성한 sw.js(셸 전용 캐시)를 추가 | 당시엔 "핵심 기능이 전부 LLM 호출이라 오프라인 캐싱이 의미 없다"는 이유로 범위 밖이었으나, MVP 마감 요구사항으로 "홈 화면 설치 시 최소한 앱 셸(빈 화면 아님)은 오프라인에서도 뜬다"가 명시적으로 추가돼 결정을 갱신함 — API 응답은 여전히 캐시하지 않아 "기능은 온라인 전제" 원칙은 유지, workbox/vite-plugin-pwa 등 새 의존성 없이 shouldCache 판별 로직만으로 구현
2026-07-10 | MVP 마감: 개발 서버를 LAN에 개방(vite server.host: true) | 폰 실기기로 홈 화면 설치를 확인하려면 필요 — 이 앱은 인증이 없어(non-goal) LAN의 누구나 노트 읽기/쓰기·LLM 호출까지 가능한 상태가 됨. 이는 F-P5(타인 공개 통제)가 의도치 않게 조기 실현된 형태라고 판단해, docs/pwa-install-check.md에 "신뢰된 사설 네트워크(집)에서만, 공용 Wi-Fi 금지" 경고와 "확인 후 즉시 dev 서버 종료" 절차를 명시함으로써 리스크를 상쇄
2026-07-10 | MVP 마감: backend에 hono/cors를 origin 전면 허용(`*`)으로 추가 | 새 의존성 아님(hono 패키지 내장 미들웨어) — 현재 쿠키/세션 등 credentials를 쓰지 않아 와일드카드 허용의 실질적 위험이 없음. 단 인증이 도입되는 시점에는 origin을 구체적으로 좁히고 credentials 옵션을 재검토하는 것이 필수(그 전까지 이대로 두면 인증 토큰이 임의 origin에 노출될 수 있음)
2026-07-10 | MVP 마감: manifest.json 아이콘을 실제 디자인 자산 부재로 플레이스홀더 SVG(모노그램 "R", theme_color 배경) 1장으로 채택, sizes: "any"로 192/512 요건을 함께 충족 | PNG 래스터 자산을 만들려면 이미지 처리 도구(새 의존성)가 필요했는데, SVG는 벡터라 크기 무관하게 한 파일로 커버 가능해 의존성 추가를 피함 — 실제 로고 확보 시 이 파일만 교체하면 됨
2026-07-10 | 버그수정: createDbClient가 DB를 열기 전에 상위 디렉터리를 mkdirSync(path.dirname(path), { recursive: true })로 먼저 보장하도록 수정(":memory:"는 예외) | 클론 직후 data/ 디렉터리가 커밋돼 있지 않아(빈 디렉터리는 git이 추적 안 함, .gitignore도 `*.db` 패턴만 있어 디렉터리 자체를 만들어주지 않음) `npm run dev`가 "Cannot open database because the directory does not exist"로 즉시 크래시했음 — 존재하지 않는 하위 디렉터리 경로로 createDbClient를 호출하는 재현 테스트를 먼저 red로 확인한 뒤 최소 수정으로 green 전환
2026-07-10 | 버그수정: AnthropicLlmClient.complete의 catch에서 RateLimitError/APIError 외의 일반 Error도 { ok:false, error:{type:"network",...} }로 변환해 반환하도록 수정 | ANTHROPIC_API_KEY 미설정 시 SDK가 네트워크 요청 전 로컬 헤더 검증 단계에서 일반 Error("Could not resolve authentication method")를 던지는데, 기존 catch는 이를 다시 throw해 LlmClient 계약을 깨고 service/route를 그대로 관통해 서버 프로세스 전체가 죽었음(문제 풀기 클릭 시 크래시) — process.env에서 인증 관련 env var를 제거한 뒤 실제 SDK 호출이 이 경로로 reject되는 것을 재현 테스트로 red 확인한 뒤 catch-all 변환으로 green 전환. `.env` 미생성 자체는 별개의 1회성 환경 설정 문제(코드 버그 아님)로 별도 판단함
2026-07-10 | UI 디자인 시스템 도입: 컴포넌트별 스타일은 CSS Modules(`*.module.css`)로 스코프, 전역 공용은 `src/styles/tokens.css`(색상·폰트 커스텀 속성만)+`global.css`(리셋·포커스링·.btn-primary/.btn-secondary)로 분리 | 새 라이브러리 없이(Vite 내장 기능) 클래스명 충돌을 피하면서 파일당 스타일을 나눌 수 있음 — `vite-env.d.ts`가 이미 `vite/client`를 참조해 `*.module.css` 타입 지원도 추가 설정 없이 됨을 확인 후 채택. `.btn-primary`/`.btn-secondary`는 여러 컴포넌트가 그대로 재사용해야 해서 의도적으로 스코프 밖에 둠(각 컴포넌트 파일 상단에 동기화 주석 명시)
2026-07-10 | UI 디자인 시스템: `docs/desigin/ui-design-proposal.html` 목업의 `:root` 토큰 21개(색상 16 + `--rule` + `--radius` + 폰트 3)를 전부 `tokens.css`로 이관, 사용자가 요약한 6색+3폰트로 축소하지 않음 | 실제 컴포넌트(표면색·테두리 2단계·텍스트 3단계·악센트별 진한/배경 변형)를 만들려면 6색만으론 부족 — 축소했다면 컴포넌트마다 즉흥적 hex가 다시 생겼을 것. 목업에 이미 정의돼 검증된 값이라 추가 설계 비용 없이 전체 이관
2026-07-10 | UI 디자인 시스템: 다크모드(`prefers-color-scheme`) 대응 안 함 | 목업 자체가 라이트 전용 팔레트(종이·잉크 은유)로 설계됐고 사용자 요청 범위에도 없음 — 다크모드가 필요해지면 토큰을 `:root`/`@media (prefers-color-scheme: dark)`로 이원화하는 별도 작업으로 진행
2026-07-10 | UI 디자인 시스템: QuestionCard.tsx/ActiveRecallCard.tsx의 ISSUE_LABELS(`Record<FeedbackIssue["type"], string>`)가 바이트 단위로 동일하게 중복 정의돼 있음을 인지했으나 이번 스타일링 작업에서 공용 모듈로 추출하지 않음 | 스타일 변경과 무관한 리팩터라 범위를 벗어남 — 로직 변경 없이 className/CSS만 건드리는 이번 작업의 원칙(기존 텍스트/role/aria-label/testid 불변)과 일관되게, 구조 리팩터는 별도 요청으로 분리해 진행하기로 함

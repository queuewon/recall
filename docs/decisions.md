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

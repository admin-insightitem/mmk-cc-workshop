# pureugong/mmk-har 리포지토리 리뷰

> 리뷰 대상: https://github.com/pureugong/mmk-har
> 리뷰 일자: 2026-04-09

---

## 1. 프로젝트 개요

`mmk-har`(Magic Meal Kits - Harness Agent Runner)는 Claude Code 에이전트가 외부 API를 CLI 도구로 활용할 수 있도록 구성한 **에이전트 하네스(Agent Harness)** 프로젝트입니다.

핵심 아이디어: **공개 REST API → Python CLI 래퍼 → Claude 스킬 연동**

### 지원 도메인

| 도메인 | 설명 | API 소스 |
|--------|------|----------|
| **SpaceCloud** | 한국 공간대여 플랫폼 검색 | `api.spacecloud.kr` (공개 API, 인증 불필요) |
| **호갱노노** | 한국 아파트 실거래가 플랫폼 | `hogangnono.com` (역공학 비공식 API) |
| **Video Summary** | YouTube 자막 추출 및 요약 | `yt-dlp` 기반 |

---

## 2. 아키텍처 분석

### 디렉토리 구조

```
mmk-har/
├── .claude/
│   ├── scripts/setup.sh          # SessionStart 훅 - 원격 환경 자동 설치
│   ├── skills/
│   │   ├── hogangnono/SKILL.md   # 호갱노노 에이전트 스킬 정의
│   │   ├── spacecloud/SKILL.md   # SpaceCloud 에이전트 스킬 정의
│   │   └── video-summary/SKILL.md # 영상 요약 스킬 정의
│   └── settings.json             # Claude Code 설정 (bypassPermissions, 플러그인)
├── agent-harness/
│   ├── cli_anything/
│   │   ├── spacecloud/           # SpaceCloud CLI 패키지
│   │   │   ├── core/             # search.py, space.py, reference.py
│   │   │   ├── utils/            # api_client.py, repl_skin.py
│   │   │   ├── tests/            # test_core.py, test_full_e2e.py
│   │   │   └── spacecloud_cli.py # Click 기반 CLI 엔트리포인트
│   │   └── hogangnono/           # 호갱노노 CLI 패키지
│   │       ├── core/             # search.py, apt.py, region.py, map.py
│   │       ├── utils/            # api_client.py, repl_skin.py
│   │       ├── tests/            # test_core.py, test_full_e2e.py
│   │       └── hogangnono_cli.py # Click 기반 CLI 엔트리포인트
│   ├── pyproject.toml
│   └── setup.py
├── docs/
│   └── 삼성역_세미나실_추천.md    # Claude가 생성한 세미나실 추천 문서
└── hogangnono-api.md             # 호갱노노 비공식 API 역공학 문서
```

### 핵심 설계 패턴

```
[사용자 요청] → [Claude Agent] → [SKILL.md 참조] → [CLI 도구 실행] → [REST API 호출] → [결과 포맷팅] → [응답]
```

1. **Skills Layer**: `.claude/skills/*/SKILL.md`가 에이전트에게 "언제, 어떻게" CLI를 사용할지 가이드
2. **CLI Layer**: Click 프레임워크 기반 CLI가 사람과 에이전트 모두 사용 가능한 인터페이스 제공
3. **Core Layer**: API 응답을 정규화하여 일관된 데이터 구조로 변환
4. **API Client Layer**: `urllib` 기반 HTTP 클라이언트 (외부 의존성 최소화)

---

## 3. 잘된 점

### 아키텍처

- **관심사 분리가 깔끔함**: `core/` (비즈니스 로직), `utils/` (API 클라이언트), `tests/` (테스트)가 명확히 분리
- **외부 의존성 최소화**: `urllib` 표준 라이브러리만 사용하여 `requests` 등 추가 패키지 불필요
- **이중 사용 설계**: CLI는 사람이 직접 사용할 수도 있고, Claude 에이전트가 사용할 수도 있음 (REPL 모드 + JSON 출력 모드)
- **플러그인 구조**: `pyproject.toml`의 `[project.scripts]`로 CLI 엔트리포인트를 깔끔하게 등록

### Claude Code 통합

- **SessionStart 훅 활용**: 원격 환경에서 자동으로 CLI 도구를 설치하는 `setup.sh`이 잘 구성됨
- **Skills 설계**: 각 스킬이 "언제 활성화되는지" (키워드 매칭)와 "어떤 워크플로우를 따르는지" (단계별 가이드)를 명확하게 정의
- **bypassPermissions**: 에이전트 자율성을 위해 권한 우회 설정이 적절하게 구성됨

### 코드 품질

- **데이터 정규화 패턴**: API 응답을 일관된 딕셔너리 구조로 변환하는 `_normalize_space()` 등의 헬퍼 활용
- **방어적 프로그래밍**: `apt.py`의 `detail()` 함수가 주 API 실패 시 대체 데이터 소스를 조합하는 폴백 로직 보유
- **가격 포맷팅**: 만원 단위를 "억/만" 한국식 표기로 변환하는 유틸리티
- **테스트 존재**: 단위 테스트와 E2E 테스트가 모두 구성되어 있음

### API 문서화

- `hogangnono-api.md`는 역공학으로 파악한 API를 체계적으로 문서화 (엔드포인트, 파라미터, 예시 포함)
- 주요 패턴 정리 테이블이 참조하기 편리함

---

## 4. 개선 제안

### 높은 우선순위

#### 4.1 README 부재
리포지토리 루트에 README.md가 없어 프로젝트의 목적과 사용법을 파악하기 어려움. 최소한 프로젝트 설명, 설치 방법, 아키텍처 다이어그램을 포함하는 README 추가 권장.

#### 4.2 호갱노노 API 역공학 리스크
`hogangnono-api.md`에 명시된 대로, 이 API는 비공식 역공학 결과물. 몇 가지 우려:
- **API 변경 시 즉시 깨질 수 있음**: 버전 관리나 공식 계약 없음
- **이용약관 위반 가능성**: 호갱노노의 ToS에서 자동화된 접근을 금지할 수 있음
- **User-Agent 위장**: `api_client.py`에서 Chrome 브라우저 헤더를 사용하는 것은 서비스 우회로 간주될 수 있음

#### 4.3 에러 핸들링 부족
`api_client.py`의 `_get()` 함수에서 HTTP 에러, 타임아웃, JSON 파싱 실패에 대한 핸들링이 보이지 않음. 네트워크 실패 시 스택 트레이스가 그대로 노출될 수 있음.

### 중간 우선순위

#### 4.4 테스트 커버리지
- 테스트 파일이 존재하지만 `test_core.py`는 주로 유틸리티 함수(가격 포맷팅, 데이터 정규화)만 검증
- 핵심 비즈니스 로직(`search`, `detail`, `trades`)에 대한 모킹 테스트 부재
- `test_full_e2e.py`는 실제 API 호출에 의존할 가능성이 높아 CI에서 불안정할 수 있음

#### 4.5 설정 하드코딩
- API base URL이 소스 코드에 직접 하드코딩 (`https://api.spacecloud.kr`, `https://hogangnono.com`)
- 환경 변수나 설정 파일로 분리하면 테스트나 프록시 환경에서 유연하게 사용 가능

#### 4.6 `setup.py`와 `pyproject.toml` 중복
둘 다 패키지 메타데이터를 정의하고 있어 관리 포인트가 두 곳. `pyproject.toml`만으로 통합하는 것이 현대적인 Python 패키징 관행.

### 낮은 우선순위

#### 4.7 REPL 스킨 분리
`repl_skin.py`가 SpaceCloud과 호갱노노에 각각 존재하지만, REPL 프롬프트 기능은 공통 유틸리티로 추출 가능.

#### 4.8 docs 폴더 관리
`docs/삼성역_세미나실_추천.md`는 Claude가 생성한 검색 결과물로, 코드 리포지토리에 포함하기보다는 별도 저장소나 위키가 더 적합할 수 있음.

---

## 5. 보안 관련 참고

| 항목 | 상태 | 비고 |
|------|------|------|
| 시크릿/토큰 노출 | OK | 코드에 하드코딩된 인증 정보 없음 |
| SSL 인증서 검증 | 주의 | `video-summary` 스킬에서 `--no-check-certificates` 사용 |
| User-Agent 위장 | 주의 | 호갱노노 API 클라이언트가 Chrome UA 헤더 사용 |
| 입력 검증 | OK | CLI 파라미터는 Click이 타입 검증 처리 |
| bypassPermissions | 인지 | 의도적 설정이나, 공유 환경에서는 주의 필요 |

---

## 6. 총평

`mmk-har`는 **"에이전트 하네스"** 패턴의 좋은 실례입니다. 공개 API를 CLI로 감싸고, Claude 스킬로 연결하는 3계층 구조가 깔끔하게 구현되어 있습니다.

**강점**: 관심사 분리, 최소 의존성, 이중 사용(사람+에이전트) 설계, Claude Code 통합(SessionStart 훅, 스킬)

**주요 개선 포인트**: README 추가, 호갱노노 API 사용의 법적/기술적 리스크 관리, 에러 핸들링 강화, 테스트 커버리지 확대

프로젝트의 패턴 자체는 다른 API를 에이전트 도구로 연동할 때 좋은 참고 템플릿이 될 수 있습니다.

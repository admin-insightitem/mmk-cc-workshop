# Claude Code 워크샵 스타터

강의 실습용 Claude Code 워크샵 스타터 프로젝트입니다.

## 프로젝트 목적

이 프로젝트를 fork하여 Claude Code 웹에서 바로 자동화 바이브 코딩을 시작할 수 있습니다.

## mmk CLI

mmk (Magic Meal Kits)는 YouTube 자막 추출, 메타데이터 조회 등을 지원하는 CLI 도구입니다.

**중요: 현재 토큰은 YouTube 전용입니다. `mmk youtube` 명령어만 사용하세요.**
`mmk notion`, `mmk paymint` 등 다른 명령어는 권한이 없어 실패합니다 (403 insufficient_scope).

### 설정

```bash
export MMK_SERVER="https://magic-meal-kits-r7fpfharja-uw.a.run.app"
export MMK_TOKEN="<강사가 제공한 토큰>"
```

### 사용 가능한 명령어

```bash
# YouTube 자막 추출
mmk youtube transcript <youtube-url>
mmk youtube transcript <youtube-url> --format json
mmk youtube transcript <youtube-url> --format srt

# YouTube 메타데이터 조회
mmk youtube metadata <youtube-url>

# YouTube 영상 타입 확인 (일반 영상 vs Short)
mmk youtube videotype <youtube-url>
```

### 사용 불가 명령어 (토큰 권한 없음)

- `mmk notion ...` — 사용 불가
- `mmk paymint ...` — 사용 불가
- `mmk threads ...` — 사용 불가

## YouTube 증시 모니터링 자동화

한국 증시 관련 YouTube 채널을 모니터링하여 키워드 매칭 영상을 자동 요약하고 Slack/Notion에 전달하는 시스템입니다.

### 모니터링 대상

| 채널 | 채널 ID |
|------|---------|
| 삼프로TV | `UChlv4GSd7OQl3js-jkLOnFA` |
| 슈카월드 | `UCsJ6RuBiTVWRX156FVbeaGg` |

### 필터 키워드

영상 제목에 `증시`, `전망`, `분석` 중 하나 이상 포함된 영상만 처리합니다.

### 사용 가능한 스킬

- `/youtube-monitor` — 전체 파이프라인 실행 (RSS 조회 → 필터 → 요약 → Slack → Notion)
- `/youtube-summarize <url>` — 단일 영상 자막 추출 및 요약
- `/slack-notify` — Slack `#all-kyungmin` 채널에 요약 알림 전송
- `/notion-save` — Notion "YouTube 증시 요약" 데이터베이스에 저장

### 자동 실행

```
/loop 1h /youtube-monitor
```

### 설정 파일

- `config/channels.json` — 채널, 키워드, Slack/Notion 설정
- `data/processed_videos.json` — 처리 완료 영상 추적

### 스크립트

- `.claude/scripts/fetch-rss.js` — YouTube RSS 피드 파싱 (Node.js)
  ```bash
  node .claude/scripts/fetch-rss.js <rss-url> [--keywords 증시,전망] [--exclude id1,id2]
  ```

## 세션 시작 시

세션이 시작되면 `.claude/scripts/check-env.sh` 스크립트가 자동 실행되어 환경 정보를 출력합니다:
- 호스트명, OS, CPU, 메모리, 디스크
- Git, Python, Node, mmk 버전
- 원격 환경 여부

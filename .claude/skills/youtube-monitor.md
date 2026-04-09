---
name: youtube-monitor
description: 한국 증시 YouTube 채널을 모니터링하고, 키워드 매칭 영상을 자동 요약하여 Slack/Notion에 전달합니다.
---

# YouTube 증시 모니터링

한국 증시 관련 YouTube 채널의 새 영상을 감지하고, 키워드 필터링 후 자막 요약 → Slack 알림 → Notion 저장까지 자동 수행합니다.

## 사용법

```
/youtube-monitor
```

수동 실행 또는 `/loop 1h /youtube-monitor`로 자동 반복 실행합니다.

## 실행 단계

### 1. 설정 로드

`config/channels.json` 파일을 읽어 채널 목록, 키워드, Slack 채널 정보를 가져옵니다.

### 2. 처리 이력 로드

`data/processed_videos.json` 파일을 읽어 이미 처리된 영상 ID 목록을 가져옵니다.

### 3. 채널별 새 영상 조회

각 채널에 대해 RSS 파싱 스크립트를 실행합니다:

```bash
node .claude/scripts/fetch-rss.js "<rssUrl>" --keywords "증시,전망,분석" --exclude "<processedId1>,<processedId2>,..."
```

- `<rssUrl>`: config에서 가져온 각 채널의 RSS URL
- `--keywords`: config에서 가져온 필터 키워드 (쉼표 구분)
- `--exclude`: 이미 처리된 영상 ID 목록 (쉼표 구분)

### 4. 새 영상 처리

3단계에서 반환된 각 영상에 대해 순서대로 수행합니다:

#### 4-1. 자막 추출 및 요약

```bash
mmk youtube transcript "<videoUrl>"
```

추출된 자막을 분석하여 한국어로 요약합니다:
- 핵심 포인트 3~5개
- 시장 시사점 1~2문장
- 구체적 수치/종목명 포함

#### 4-2. Slack 알림 전송

`config/channels.json`에서 Slack 채널 ID(`C09JXF2BV33`)를 읽고,
`slack_send_message` MCP 도구로 아래 형식의 메시지를 전송합니다:

```
📺 *[{채널명}] 새 영상 요약*

*제목:* {영상 제목}
*링크:* {YouTube URL}
*게시일:* {게시일}

📝 *요약:*
• {핵심 포인트 1}
• {핵심 포인트 2}
• {핵심 포인트 3}

💡 *시장 시사점:*
{시사점}
```

#### 4-3. Notion 저장

`config/channels.json`에서 Notion 데이터베이스 ID(`c17c487212c1471fa0056dedfda6a68f`)를 읽습니다.
데이터베이스가 없으면 "푸르공 워크샵" 페이지(`33d66431c1798048a534e62422dcbbff`) 하위에 새로 생성합니다.

`notion-create-pages` MCP 도구로 다음 데이터를 저장합니다:
- 제목: 영상 제목
- 채널: 채널명 (삼프로TV / 슈카월드)
- URL: YouTube 링크
- 게시일: 영상 게시 날짜
- 요약: AI 요약 텍스트 (content 본문에도 포함)
- 키워드: 매칭된 키워드
- 처리일시: 현재 날짜

#### 4-4. 처리 이력 업데이트

처리 완료된 영상 ID를 `data/processed_videos.json`의 `processedIds` 배열에 추가하고,
`lastRun`을 현재 시간으로 업데이트합니다.

### 5. 결과 보고

처리 결과를 요약하여 출력합니다:
- 조회한 채널 수
- 발견한 새 영상 수
- 처리 완료한 영상 수
- 새 영상이 없으면 "새로운 증시 관련 영상이 없습니다." 출력

## 오류 처리

- RSS 피드 조회 실패: 해당 채널 건너뛰고 다음 채널 처리
- 자막 추출 실패: 해당 영상 건너뛰고 사용자에게 알림
- Slack/Notion 전송 실패: 오류 로그 출력 후 계속 진행
- 모든 오류는 처리 이력에 영향을 주지 않음 (실패한 영상은 다음 실행 시 재시도)

## 스케줄링

```
/loop 1h /youtube-monitor
```

1시간 간격으로 자동 실행됩니다.

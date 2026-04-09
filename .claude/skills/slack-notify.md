---
name: slack-notify
description: Slack 채널에 YouTube 영상 요약 알림을 전송합니다.
---

# Slack 알림 전송

YouTube 영상 요약을 Slack 채널에 전송합니다.

## 사용법

```
/slack-notify
```

인자로 채널명, 영상 제목, URL, 요약 내용을 전달받아 Slack에 전송합니다.

## 실행 단계

### 1. Slack 채널 ID 조회

`slack_search_channels` MCP 도구로 대상 채널을 검색합니다.

- 기본 채널: `#all-kyungmin` (config/channels.json 참조)
- 검색어: `all-kyungmin`

### 2. 메시지 포맷 구성

아래 형식으로 메시지를 구성합니다:

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
{시사점 내용}
```

### 3. 메시지 전송

`slack_send_message` MCP 도구를 사용하여 메시지를 전송합니다.

- `channel_id`: 1단계에서 조회한 채널 ID
- `message`: 2단계에서 구성한 메시지

### 주의사항

- 메시지 최대 길이: 5000자
- 요약이 길 경우 핵심만 추려서 전송
- Slack 마크다운 형식 사용 (*bold*, _italic_, • bullet)

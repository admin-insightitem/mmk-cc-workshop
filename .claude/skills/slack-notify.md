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

### 1. Slack 채널 ID 확인

`config/channels.json`에서 Slack 채널 ID를 읽습니다.

- 채널: `#all-kyungmin`
- 채널 ID: `C09JXF2BV33` (kyungmingroup.slack.com)
- config에 channelId가 없으면 `slack_search_channels`로 검색

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

- `channel_id`: `C09JXF2BV33` (또는 config에서 읽은 채널 ID)
- `message`: 2단계에서 구성한 메시지

### 주의사항

- 메시지 최대 길이: 5000자
- 요약이 길 경우 핵심만 추려서 전송
- Slack 마크다운 형식 사용 (*bold*, _italic_, • bullet)

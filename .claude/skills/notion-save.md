---
name: notion-save
description: YouTube 영상 요약을 Notion 데이터베이스에 저장합니다.
---

# Notion 데이터베이스 저장

YouTube 영상 요약 데이터를 Notion 데이터베이스에 새 페이지로 저장합니다.

## 사용법

```
/notion-save
```

영상 정보(제목, 채널, URL, 게시일, 요약, 키워드)를 전달받아 Notion에 저장합니다.

## 실행 단계

### 1. 데이터베이스 찾기

`notion-search` MCP 도구로 "YouTube 증시 요약" 데이터베이스를 검색합니다.

```
query: "YouTube 증시 요약"
filters: { "type": "database" }
```

데이터베이스를 찾지 못하면 사용자에게 알리고, 아래 Step 1-1로 새로 생성합니다.

#### Step 1-1. 데이터베이스 생성 (최초 1회)

`notion-search`로 저장할 부모 페이지를 먼저 찾고, `notion-create-database` MCP 도구를 사용합니다.

```sql
CREATE TABLE "YouTube 증시 요약" (
  "제목" TITLE,
  "채널" SELECT('삼프로TV', '슈카월드'),
  "URL" URL,
  "게시일" DATE,
  "요약" RICH_TEXT,
  "키워드" MULTI_SELECT('증시', '전망', '분석'),
  "처리일시" DATE
);
```

### 2. 데이터베이스 스키마 확인

`notion-fetch` MCP 도구로 데이터베이스 ID를 사용하여 스키마를 확인합니다.

### 3. 새 페이지 생성

`notion-create-pages` MCP 도구로 데이터를 저장합니다.

```json
{
  "parent": { "database_id": "<database-id>" },
  "pages": [
    {
      "properties": {
        "제목": "영상 제목",
        "채널": "삼프로TV",
        "URL": "https://www.youtube.com/watch?v=...",
        "게시일": "2026-04-09",
        "키워드": ["증시", "전망"],
        "처리일시": "2026-04-09"
      },
      "content": "## 요약\n\n• 핵심 포인트 1\n• 핵심 포인트 2\n..."
    }
  ]
}
```

### 주의사항

- 날짜 형식: ISO 8601 (YYYY-MM-DD)
- 요약 내용은 페이지 content로 저장 (rich_text 속성 + 본문)
- 키워드는 제목에서 매칭된 키워드만 multi_select로 저장

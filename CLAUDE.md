# Claude Code 워크샵 스타터

강의 실습용 Claude Code 워크샵 스타터 프로젝트입니다.

## 프로젝트 목적

이 프로젝트를 fork하여 Claude Code 웹에서 바로 자동화 바이브 코딩을 시작할 수 있습니다.

## mmk CLI

mmk (Magic Meal Kits)는 YouTube 자막 추출, 메타데이터 조회 등을 지원하는 CLI 도구입니다.

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

## 세션 시작 시

세션이 시작되면 `.claude/scripts/check-env.sh` 스크립트가 자동 실행되어 환경 정보를 출력합니다:
- 호스트명, OS, CPU, 메모리, 디스크
- Git, Python, Node, mmk 버전
- 원격 환경 여부

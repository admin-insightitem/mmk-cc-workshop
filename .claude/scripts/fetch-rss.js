#!/usr/bin/env node
/**
 * YouTube RSS 피드 파서
 * 사용법:
 *   curl -s <rss-url> | node fetch-rss.js [--keywords 증시,전망,분석] [--exclude videoId1,videoId2]
 *   node fetch-rss.js <rss-url> [--keywords 증시,전망,분석] [--exclude videoId1,videoId2]
 * 출력: JSON 배열 [{videoId, title, published, link}]
 */

const { execSync } = require('child_process');

function parseEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = (entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1];
    const title = (entry.match(/<title>(.*?)<\/title>/) || [])[1];
    const published = (entry.match(/<published>(.*?)<\/published>/) || [])[1];

    if (videoId && title) {
      entries.push({
        videoId,
        title: decodeXmlEntities(title),
        published,
        link: `https://www.youtube.com/watch?v=${videoId}`
      });
    }
  }
  return entries;
}

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const args = process.argv.slice(2);
  let keywords = [];
  let excludeIds = [];
  let rssUrl = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keywords' && args[i + 1]) {
      keywords = args[++i].split(',');
    } else if (args[i] === '--exclude' && args[i + 1]) {
      excludeIds = args[++i].split(',');
    } else if (!args[i].startsWith('--')) {
      rssUrl = args[i];
    }
  }

  let xml;

  if (rssUrl) {
    // URL이 주어지면 curl로 직접 가져오기
    try {
      xml = execSync(`curl -s "${rssUrl}"`, { encoding: 'utf8', timeout: 30000 });
    } catch (err) {
      console.error('오류: RSS 피드를 가져올 수 없습니다:', err.message);
      process.exit(1);
    }
  } else {
    // stdin에서 읽기
    xml = await readStdin();
    if (!xml) {
      console.error('사용법: curl -s <rss-url> | node fetch-rss.js [--keywords 증시,전망] [--exclude id1,id2]');
      console.error('   또는: node fetch-rss.js <rss-url> [--keywords 증시,전망] [--exclude id1,id2]');
      process.exit(1);
    }
  }

  let entries = parseEntries(xml);

  if (excludeIds.length > 0) {
    entries = entries.filter(e => !excludeIds.includes(e.videoId));
  }

  if (keywords.length > 0) {
    entries = entries.filter(e =>
      keywords.some(kw => e.title.includes(kw))
    );
  }

  console.log(JSON.stringify(entries, null, 2));
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});

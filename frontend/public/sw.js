// frontend/src/sw/shouldCache.ts가 이 캐시 판별 규칙을 TS로 미러링해 유닛 테스트한다.
// 이 파일은 public/에 있어 번들링되지 않으므로 import를 못 쓴다 — 아래 API_PREFIXES를
// 바꾸면 반드시 src/sw/shouldCache.ts의 API_PREFIXES도 함께 바꿔야 한다.
const CACHE_NAME = "recall-lab-shell-v1";
const SHELL_URLS = ["/", "/manifest.json", "/icons/icon.svg"];
const API_PREFIXES = ["/notes", "/questions", "/health"];

function shouldCache(pathname) {
  const isApiPath = API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return !isApiPath;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !shouldCache(url.pathname)) {
    // API 호출·타 출처 요청은 항상 네트워크로만 — 기능(노트/문제/채점)은 온라인 전제, 셸만 캐시한다.
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
  );
});

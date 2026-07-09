// public/sw.js의 shouldCache()가 이 규칙을 인라인으로 복제해 쓴다(SW는 정적 서빙이라 import 불가).
// 이 파일의 API_PREFIXES를 바꾸면 public/sw.js의 API_PREFIXES도 반드시 함께 바꿔야 한다.
const API_PREFIXES = ["/notes", "/questions", "/health"];

export function shouldCache(pathname: string): boolean {
  const isApiPath = API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return !isApiPath;
}

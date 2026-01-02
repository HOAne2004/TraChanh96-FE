export function resolveImage(url, fallback) {
  const domain = "https://trachanh96-be-production.up.railway.app";

  if (!url) return fallback;

  // Nếu là full URL thì giữ nguyên
  if (url.startsWith("http")) return url;

  // Nếu backend trả đường dẫn windows -> normalize
  url = url.replace(/\\/g, "/");

  // Đảm bảo có dấu /
  if (!url.startsWith("/")) url = "/" + url;

  return domain + url;
}

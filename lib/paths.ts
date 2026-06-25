export function assetPath(path: string) {
  if (!path) return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

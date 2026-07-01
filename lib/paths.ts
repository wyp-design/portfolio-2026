export function assetPath(path: string) {
  if (!path) return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function optimizedAssetPath(path: string, width = 640, quality = 75) {
  if (!path || /^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const resolved = assetPath(path);
  if (process.env.NEXT_PUBLIC_BASE_PATH) return resolved;
  return `/_next/image?url=${encodeURIComponent(resolved)}&w=${width}&q=${quality}`;
}

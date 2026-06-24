import { getPortfolioStore } from "@/lib/blob-store";

const MIME_BY_EXTENSION: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

function guessMimeType(key: string) {
  const extension = key.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXTENSION[extension] || "application/octet-stream";
}

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const blobKey = key.join("/");
  const store = getPortfolioStore();
  const [metadata, body] = await Promise.all([
    store.getMetadata(blobKey, { consistency: "strong" }),
    store.get(blobKey, { type: "arrayBuffer", consistency: "strong" }),
  ]);

  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      "Content-Type": metadata?.contentType || guessMimeType(blobKey),
      "Cache-Control": metadata?.cacheControl || "public, max-age=31536000, immutable",
    },
  });
}

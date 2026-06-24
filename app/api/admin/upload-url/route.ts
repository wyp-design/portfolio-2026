import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPortfolioStore } from "@/lib/blob-store";

function safeFilename(filename: string) {
  const normalized = filename
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "upload";
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { filename?: string; contentType?: string } | null;
  const filename = safeFilename(body?.filename || "upload");
  const contentType = body?.contentType || "application/octet-stream";
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
  const store = getPortfolioStore();
  const upload = await store.createUploadUrl(key, {
    expireSeconds: 15 * 60,
    contentType,
  });

  return NextResponse.json({
    ...upload,
    fileUrl: `/api/media/${key}`,
  });
}

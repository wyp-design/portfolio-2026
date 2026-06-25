import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import { commitBinaryFile } from "@/lib/github-cms";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = new Map([
  ["image/png", "PNG"],
  ["image/jpeg", "JPG"],
  ["image/gif", "GIF"],
  ["image/webp", "WEBP"],
  ["application/pdf", "PDF"],
  ["video/mp4", "MP4"],
]);

function safeFilename(filename: string) {
  const extension = filename.includes(".") ? filename.split(".").pop() || "" : "";
  const basename = extension ? filename.slice(0, -(extension.length + 1)) : filename;
  const normalized = filename
    ? basename
        .normalize("NFKD")
        .replace(/[^\w.\-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80)
    : "";
  const safeBase = normalized || "upload";
  const safeExtension = extension.replace(/[^\w]+/g, "").slice(0, 12);
  return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "没有收到文件" }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: `暂不支持这个文件类型。请上传 PNG / JPG / GIF / WEBP / PDF / MP4${file.type ? `，当前文件类型是 ${file.type}` : ""}。` },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          message: `文件太大：${formatFileSize(file.size)}。当前后台单个文件限制为 ${formatFileSize(MAX_UPLOAD_BYTES)}，请压缩后再上传。`,
        },
        { status: 413 },
      );
    }

    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeFilename(file.name)}`;
    const filePath = `public/uploads/${filename}`;
    await commitBinaryFile(filePath, await file.arrayBuffer(), `Upload ${file.name} from admin`);

    return NextResponse.json({
      fileUrl: `/uploads/${filename}`,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "上传到 GitHub 失败",
        detail: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

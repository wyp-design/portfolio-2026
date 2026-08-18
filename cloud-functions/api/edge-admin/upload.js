import {
  commitBuffer,
  errorResponse,
  isAdminRequest,
  jsonResponse,
  unauthorized,
} from "../../_lib/admin-cms.js";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
]);

function safeFilename(filename) {
  const extension = filename.includes(".") ? filename.split(".").pop() || "" : "";
  const basename = extension ? filename.slice(0, -(extension.length + 1)) : filename;
  const normalized = basename
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const safeExtension = extension.replace(/[^\w]+/g, "").slice(0, 12);
  return `${normalized || "upload"}${safeExtension ? `.${safeExtension}` : ""}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export async function onRequestPost(context) {
  if (!isAdminRequest(context)) return unauthorized();
  try {
    const formData = await context.request.formData();
    const file = formData.get("file");
    const thumbnail = formData.get("thumbnail");
    if (!(file instanceof File)) return jsonResponse({ message: "没有收到文件" }, 400);
    if (!ACCEPTED_TYPES.has(file.type)) {
      return jsonResponse({ message: "暂不支持这个文件类型。请上传 PNG / JPG / GIF / WEBP / PDF / MP4。" }, 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonResponse({
        message: `文件太大：${formatFileSize(file.size)}。当前后台单个文件限制为 ${formatFileSize(MAX_UPLOAD_BYTES)}，请压缩后再上传。`,
      }, 413);
    }

    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeFilename(file.name)}`;
    await commitBuffer(context.env, `public/uploads/${filename}`, await file.arrayBuffer(), `Upload ${file.name} from admin`);

    let thumbnailUrl;
    if (thumbnail instanceof File && thumbnail.type === "image/jpeg" && thumbnail.size <= MAX_THUMBNAIL_BYTES) {
      const thumbnailFilename = `${Date.now()}-${crypto.randomUUID()}-${safeFilename(thumbnail.name)}`;
      await commitBuffer(
        context.env,
        `public/uploads/thumbnails/${thumbnailFilename}`,
        await thumbnail.arrayBuffer(),
        `Upload thumbnail for ${file.name}`,
      );
      thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    }

    return jsonResponse({
      fileUrl: `/uploads/${filename}`,
      thumbnailUrl,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
    });
  } catch (error) {
    return errorResponse("上传到 GitHub 失败", error);
  }
}


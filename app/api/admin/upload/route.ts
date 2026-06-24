import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import { commitBinaryFile } from "@/lib/github-cms";

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

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "没有收到文件" }, { status: 400 });
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

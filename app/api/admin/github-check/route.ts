import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import { checkGithubWriteAccess } from "@/lib/github-cms";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  try {
    const result = await checkGithubWriteAccess();
    return NextResponse.json({
      ok: true,
      message: `GitHub 已连接：${result.repository} / ${result.branch}`,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "GitHub 检测失败",
        detail: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

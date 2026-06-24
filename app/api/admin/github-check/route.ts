import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        message: "缺少 GITHUB_TOKEN",
        detail: "请在 EdgeOne 项目环境变量里添加 GITHUB_TOKEN，然后重新部署。",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "GitHub Token 已配置，可以保存发布。",
  });
}

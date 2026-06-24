import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import { commitJsonFile } from "@/lib/github-cms";
import { getPortfolioContent, normalizePortfolioContent } from "@/lib/portfolio-data";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  return NextResponse.json(await getPortfolioContent());
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const content = normalizePortfolioContent({
      ...body,
      updatedAt: new Date().toISOString(),
    });
    await commitJsonFile("content/portfolio-content.json", content, "Update portfolio content from admin");
    return NextResponse.json({
      ...content,
      publishMode: "github",
      message: "已提交到 GitHub，等待 EdgeOne 自动重新部署后生效。",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "保存到 GitHub 失败",
        detail: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

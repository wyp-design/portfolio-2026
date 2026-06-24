import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import { getPortfolioContent, normalizePortfolioContent, savePortfolioContent } from "@/lib/portfolio-data";

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
    const content = normalizePortfolioContent(body);
    const savedContent = await savePortfolioContent(content);
    return NextResponse.json(savedContent);
  } catch (error) {
    return NextResponse.json(
      {
        message: "保存到 EdgeOne Blob 失败",
        detail: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPortfolioStore } from "@/lib/blob-store";
import { getErrorMessage } from "@/lib/error-message";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  try {
    const store = getPortfolioStore();
    const key = `diagnostics/blob-check-${Date.now()}.txt`;
    await store.set(key, "ok", { cacheControl: "no-store" });
    const value = await store.get(key, { consistency: "strong" });
    await store.delete(key);

    return NextResponse.json({
      ok: value === "ok",
      message: value === "ok" ? "Blob 可写入" : "Blob 写入后读取异常",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Blob 不可写入",
        detail: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

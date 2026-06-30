import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 12_000;
const CHUNK_LENGTH = 1_200;

function splitText(text: string) {
  const chunks: string[] = [];
  for (const part of text.split(/(\n+)/)) {
    if (!part) continue;
    if (/^\n+$/.test(part)) {
      chunks.push(part);
      continue;
    }
    for (let index = 0; index < part.length; index += CHUNK_LENGTH) {
      chunks.push(part.slice(index, index + CHUNK_LENGTH));
    }
  }
  return chunks;
}

async function translateWithGoogle(text: string, signal: AbortSignal) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: "zh-CN",
    tl: "en",
    dt: "t",
    q: text,
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Translation service returned ${response.status}`);
  const result = (await response.json()) as Array<Array<Array<string | null>>>;
  const translated = result[0]?.map((item) => item?.[0] || "").join("");
  if (!translated) throw new Error("Translation service returned an empty result");
  return translated;
}

async function translateText(text: string) {
  if (!/[\u3400-\u9fff]/u.test(text)) return text;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const translated: string[] = [];
    for (const chunk of splitText(text)) {
      translated.push(/^\n+$/.test(chunk) ? chunk : await translateWithGoogle(chunk, controller.signal));
    }
    return translated.join("");
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: "登录已过期，请重新登录后台。" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { text?: unknown };
    if (typeof body.text !== "string") {
      return NextResponse.json({ message: "请输入需要翻译的中文。" }, { status: 400 });
    }
    if (body.text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ message: `单次翻译不能超过 ${MAX_TEXT_LENGTH} 个字符。` }, { status: 413 });
    }

    return NextResponse.json({ translation: await translateText(body.text) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown translation error";
    return NextResponse.json({ message: "自动翻译暂时失败，可稍后重试或手动填写英文。", detail }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminSessionValue,
  isAdminRequest,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminRequest() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ message: "密码不正确" }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookieName, await createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

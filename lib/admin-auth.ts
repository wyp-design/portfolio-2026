import { cookies } from "next/headers";

const COOKIE_NAME = "portfolio_admin";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "change-me-now";
}

async function sign(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAdminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSessionValue() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${await sign(issuedAt)}`;
}

export async function isValidAdminSession(value?: string) {
  if (!value) return false;
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;

  const maxAge = 1000 * 60 * 60 * 24 * 7;
  if (Number.isNaN(Number(issuedAt)) || Date.now() - Number(issuedAt) > maxAge) return false;

  return signature === (await sign(issuedAt));
}

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export const adminCookieName = COOKIE_NAME;

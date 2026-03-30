"use server";

import { getAuthCookie } from "@/services/cookies";

export async function decodeToken<T = Record<string, unknown>>(): Promise<T | null> {
  const cookie = await getAuthCookie("token");

  if (!cookie?.value) return null;

  const token = cookie.value.startsWith("Bearer ")
    ? cookie.value.slice(7)
    : cookie.value;

  const payloadBase64 = token.split(".")[1];
  if (!payloadBase64) return null;

  const json = Buffer.from(payloadBase64, "base64url").toString("utf-8");
  return JSON.parse(json) as T;
}

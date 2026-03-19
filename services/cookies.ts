"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 2,
    path: "/",
  });
}

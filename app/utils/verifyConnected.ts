import { getAuthCookie } from "@/services/cookies";
import { redirect } from "next/navigation";

export const verifyConnected = async (page: string) => {
  const token = getAuthCookie("token");
  console.log(page)
  if (await token) {
    redirect(page);
  } else {
    redirect("/login")
  }
};

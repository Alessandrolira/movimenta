import { getAuthCookie } from "@/services/cookies"
import { redirect } from "next/navigation";

export const verifyConnected = async () => {
    const token = getAuthCookie("token");
    if (await token) {
        redirect("/dashboard")
    }
    else {
        redirect("/login")
    }
}
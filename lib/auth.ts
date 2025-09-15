import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/route";

export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
export function requireRole(user: any, role: "ADMIN" | "AUTHOR" | "USER") {
  if (!user || user.role !== role) {
    throw new Error("没有权限访问");
  }
}
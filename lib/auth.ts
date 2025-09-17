import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/route";
import { prisma } from "./prisma";

export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
export function requireRole(user: any, role: "ADMIN" | "AUTHOR" | "USER") {
  if (!user || user.role !== role) {
    throw new Error("没有权限访问");
  }
}
export async function isLoggedIn() {
  const user = await getUser();
  return !!user;
}
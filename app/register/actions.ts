"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from 'zod';
import { redirect } from "next/navigation";

const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "at least 8"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "not the same password",
    path: ["confirm"],
  });

export async function registerAction(formData: FormData) {
  const data = Object.fromEntries(formData) as Record<string, any>;

  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "wrong params";
    // redirect to page register with errorinfo
    redirect(`/register?error=${encodeURIComponent(String(firstError))}`);
  }

  const { email, password } = parsed.data;

  const exist = await prisma.user.findUnique({ where: { email } });
  if (exist) {
    redirect(`/register?error=${encodeURIComponent("this email is already exist")}`);
  }

  // hash password
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: email.split("@")[0],
    },
  });

  redirect("/login?registered=1");
}

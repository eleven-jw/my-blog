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
  const rawInput = {
    email: (formData.get('email') ?? '').toString(),
    password: (formData.get('password') ?? '').toString(),
    confirm: (formData.get('confirm') ?? '').toString(),
  };

  const parsed = RegisterSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "wrong params";
    // redirect to page register with errorinfo
    redirect(`/register?error=${encodeURIComponent(String(firstError))}`);
    return;
  }

  const { email, password } = parsed.data;
  const image = 'avatar.jpg';

  const exist = await prisma.user.findUnique({ where: { email } });
  if (exist) {
    redirect(`/register?error=${encodeURIComponent("this email is already exist")}`);
    return;
  }

  // hash password
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      image,
      password: hashed,
      name: email.split("@")[0],
    },
  });

  redirect("/login?registered=1");
}

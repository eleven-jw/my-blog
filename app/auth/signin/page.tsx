"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div>
      <h1>登录</h1>
      <button onClick={() => signIn("google")}>使用 Google 登录</button>
      <button onClick={() => signIn("credentials", { email: "test@test.com", password: "123456" })}>
        使用邮箱/密码登录
      </button>
    </div>
  );
}

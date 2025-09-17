"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        const email = (fd.get("email") as string) ?? "";
        const password = (fd.get("password") as string) ?? "";

        // usr next-auth signIn with credentials
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        setLoading(false);

        if (!res) {
            setError("Login fail");
            return;
        }

        if (res.error) {
            setError(res.error || "invalidate username or password");
            return;
        }

        router.push("/");
  }

    async function handleSocialSignIn(provider: "google" | "github") {
        setLoading(true);
        setError(null);
        try {
            // redirect: true make NextAuth redirect to  provider
            await signIn(provider, { callbackUrl: "/" });
        } catch (err) {
            console.error(err);
            setError("login fail, try again");
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual / marketing side */}
          <div className="hidden md:flex flex-col justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 p-8 text-white shadow-lg">
            <h2 className="text-3xl font-extrabold">Welcome back</h2>
            <p className="mt-2 text-sm opacity-90">Sign in to continue to write you blogs.</p>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 9h14" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Warm & Inviting</div>
                  <div className="text-xs opacity-90">a morning coffee ritual, a sunset from a weekend hike</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 18v4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium"> Professional & Actionable </div>
                  <div className="text-xs opacity-90">no fluff, just actionable insights</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs opacity-90">Not your first time? Sign in with one click then write you blog.</div>
          </div>

          {/* Form side */}
          <Card className="rounded-2xl shadow">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your account credentials to log in.</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="remember" className="text-sm">Remember me</label>
                  </div>

                  {/* <a href="#" className="text-sm text-sky-600 hover:underline">Forgot password?</a> */}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button type="submit" className="w-full">Sign in</Button>

                  <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-gray-400">or continue with</span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialSignIn("google")}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0z" />
                      </svg>
                      Google
                    </Button>

                    <Button variant="outline" className="flex items-center justify-center gap-2" onClick={() => handleSocialSignIn("github")}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" />
                      </svg>
                      GitHub
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500 mt-3">
                    Don’t have an account? 
                  <Link href="/register" className="text-sky-600 hover:underline">
                      Sign up
                  </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

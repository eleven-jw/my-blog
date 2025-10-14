import { registerAction } from "./actions";
import Link from "next/link";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-2">Create account</h1>
          <p className="text-sm text-gray-500 mb-4">Register with your email and password.</p>

          <form action={registerAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">At lease 8 charactars.</p>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">Register</button>
              <Link href="/login" className="text-sm text-sky-600 hover:underline">
                  Have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
        <div id="register-flash" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              const params = new URLSearchParams(location.search);
              const err = params.get('error');
              const ok = params.get('registered');
              if(err){
                const el = document.getElementById('register-flash');
                el.innerHTML = '<div class="mt-4 text-sm text-red-600">' + decodeURIComponent(err) + '</div>';
              } else if(ok){
                const el = document.getElementById('register-flash');
                el.innerHTML = '<div class="mt-4 text-sm text-green-600">注册成功，请登录</div>';
              }
            })();
          `,
          }}
        />
      </div>
    </div>
  );
}

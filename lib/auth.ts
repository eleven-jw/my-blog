import { getServerSession } from "next-auth/next";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('credentials', credentials)
        if (!credentials?.email || !credentials?.password) {
          console.log('please input you email and password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('no this user');
          throw new Error('no this user');
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          console.log('wrong password');
          throw new Error('wrong password');
        }

        if (credentials?.remember === true) {
          console.log(credentials?.remember);
          const refreshToken = process.env.REFRESH_TOKEN_SECRET;
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30days

          await prisma.session.create({
            data: {
              sessionToken: refreshToken,
              userId: user.id,
              expires: expiresAt,
            },
          });

          // 将刷新令牌嵌入 JWT
          const accessToken = jwt.sign(
            {
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + 3600, // expired time 1 h
              remember: credentials?.remember,
              refreshToken: refreshToken, 
            },
            process.env.ACCESS_TOKEN_SECRET!,
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          remember: credentials?.remember === true, 
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,  // prevent XSS
      sameSite: 'lax',  // prevent CSRF 
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      //optional for report
      console.log('user', user);
      console.log('account', account);
      console.log('profile', profile);
      console.log('email', email);
      console.log('credentials', credentials);
      return true;
    },
    authorized({auth, request:{nextUrl}}) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith('/');
        if(isOnDashboard) {
            if(isLoggedIn) {
                return true;
            }
            return false;
        } else if(isLoggedIn) {
            return Response.redirect(new URL('/', nextUrl));
        }
          
        return true;
    },
    async session({ session, token }) {
      console.log('session', session)
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // fisrt login
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.remember = account?.remember;
      }
      // token expired refresh token
      if (token.expired && token.refresh_token) {
        try {
          const storedToken = await prisma.session.findUnique({
            where: { sessionToken: token.refresh_token },
          });

          if (!storedToken || storedToken.expires < new Date()) {
            throw new Error('invalid or expired token!');
          }

          // generate new accessToken（JWT
          const newAccessToken = jwt.sign(
            {
              sub: token.sub,
              email: token.email,
              remember: token.remember,
              exp: Math.floor(Date.now() / 1000) + 3600, // 1h later
            },
            process.env.ACCESS_TOKEN_SECRET!,
          );

          token.accessToken = newAccessToken;
          token.expiresIn = '1h';

          // 2.6 generate refreshToken
          const newRefreshToken = process.env. REFRESH_TOKEN_SECRET;
          const newRefreshExpiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
          );

          // 2.7 update refreshToken
          await prisma.session.update({
            where: { id: storedToken.id },
            data: {
              sessionToken: newRefreshToken,
              expires: newRefreshExpiresAt,
            },
          });

          token.refreshToken = newRefreshToken;
          return token;
        } catch (err) {
          console.error('刷新令牌失败:', err);
        }
      }

      return token;
    },
    async signOut({ token, session, req, res }) {
        if (session?.user?.id) {
            // 清除 HttpOnly Cookie（关键！）
            res.clearCookie('next-auth.session-token', {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
        });

        // 清理数据库会话记录
        await prisma.session.deleteMany({
            where: { userId: session.user.id },
        });
        }
        return;
    },
  },
  pages: {
    signIn: "/login",
  },
};
export const { auth, signIn, signOut } = NextAuth(authOptions);

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

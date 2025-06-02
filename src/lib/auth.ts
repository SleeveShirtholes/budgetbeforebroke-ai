import * as authSchema from "../db/schema";

import type { Session } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { Resend } from "resend";
import { db } from "../db/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await resend.emails.send({
        from: "Budget Before Broke <verification@verification.budgetbeforebroke.com>",
        to: user.email,
        subject: "Verify your email address",
        html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">Welcome to Budget Before Broke!</h1>
                        <p style="color: #666;">Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500; transition: background-color 0.2s;">Verify Email Address</a>
                        </div>
                        <p style="color: #666;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                `,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await resend.emails.send({
        from: "Budget Before Broke <verification@verification.budgetbeforebroke.com>",
        to: user.email,
        subject: "Reset your password",
        html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">Reset Your Password</h1>
                        <p style="color: #666;">Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500; transition: background-color 0.2s;">Reset Password</a>
                        </div>
                        <p style="color: #666;">If you didn't request this email, you can safely ignore it.</p>
                    </div>
                `,
      });
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async session({ session }: { session: Session }) {
      return session;
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },
  plugins: [
    nextCookies(),
    passkey({
      rpID:
        process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
        "localhost",
      rpName: "Budget Before Broke",
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
  ],
});

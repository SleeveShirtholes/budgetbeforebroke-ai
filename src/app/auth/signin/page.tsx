"use client";

import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<
    "google" | "email" | "passkey" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [canUsePasskey, setCanUsePasskey] = useState(false);

  useEffect(() => {
    const checkPasskeySupport = async () => {
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        setCanUsePasskey(true);
        // Preload passkeys for conditional UI
        try {
          const isAvailable =
            await PublicKeyCredential.isConditionalMediationAvailable();
          if (isAvailable) {
            void authClient.signIn.passkey({ autoFill: true });
          }
        } catch (err) {
          console.error("Error checking conditional mediation:", err);
        }
      }
    };

    void checkPasskeySupport();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading("google");
      setError(null);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (error?.message) {
        setError(error.message);
        return;
      }
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasskeySignIn = async () => {
    try {
      setIsLoading("passkey");
      setError(null);

      const result = await authClient.signIn.passkey();

      if (result?.error) {
        setError(result.error.message || "Failed to sign in with passkey");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Passkey sign-in error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign in with passkey",
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading("email");
      setError(null);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              setError("Please verify your email address");
            } else {
              setError(ctx.error.message);
            }
          },
        },
      );

      router.push("/dashboard");
    } catch {
      setError("Failed to sign in with email");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card variant="default" padding="lg" className="w-[600px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-sm text-gray-500">
            Choose your preferred sign in method
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="grid gap-4">
          {canUsePasskey && (
            <Button
              variant="outline"
              onClick={handlePasskeySignIn}
              fullWidth
              disabled={isLoading !== null}
            >
              {isLoading === "passkey" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Continue with Passkey
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            fullWidth
            disabled={isLoading !== null}
          >
            {isLoading === "google" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <form onSubmit={handleEmailSignIn} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading !== null}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="username webauthn"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading !== null}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="current-password webauthn"
              />
            </div>
            <Button type="submit" fullWidth disabled={isLoading !== null}>
              {isLoading === "email" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign in with Email"
              )}
            </Button>
          </form>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Button variant="text" href="/auth/signup">
            Sign up
          </Button>
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          <Button variant="text" href="/auth/forgot-password">
            Forgot your password?
          </Button>
        </div>
      </Card>
    </div>
  );
}

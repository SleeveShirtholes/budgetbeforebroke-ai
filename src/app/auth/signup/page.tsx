"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Card from "@/components/Card";
import PasswordField from "@/components/Forms/PasswordField";
import PasswordStrengthMeter from "@/components/Forms/PasswordStrengthMeter";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

// Helper function to check password strength
function getPasswordStrength(password: string) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!minLength) return { level: "Weak", valid: false };
  if (minLength && hasUpper && hasSpecial)
    return { level: "Strong", valid: true };
  if (minLength && (hasUpper || hasSpecial))
    return { level: "Medium", valid: false };
  return { level: "Weak", valid: false };
}

// Helper function to check password requirements
function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export default SignUpForm;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const [isLoading, setIsLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Password strength and requirements
  const passwordStrength = getPasswordStrength(password);
  const passwordReqs = getPasswordRequirements(password);
  const passwordsMatch = password === confirmPassword;

  // Handle Google sign up
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading("google");
      setError(null);
      // Use signIn.social for Google OAuth
      const { error } = await authClient.signIn.social({
        provider: "google",
      });
      if (error?.message) {
        setError(error.message);
        return;
      }
      if (inviteToken) {
        router.push(`/api/invite/accept?token=${inviteToken}`);
      } else {
        router.push("/auth/new-user");
      }
    } catch {
      setError("Failed to sign up with Google");
    } finally {
      setIsLoading(null);
    }
  };

  // Handle email/password sign up
  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!passwordStrength.valid) {
      setError("Password does not meet requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setIsLoading("email");
      setError(null);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const name = formData.get("name") as string;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (error?.message) {
        setError(error.message);
        return;
      }
      if (inviteToken) {
        // Redirect to accept invite if token is present
        router.push(`/api/invite/accept?token=${inviteToken}`);
      } else {
        router.push("/auth/verify-request");
      }
    } catch {
      setError("Failed to sign up with email");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card variant="default" padding="lg" className="w-[600px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <p className="text-sm text-gray-500">Create your account</p>
        </div>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="grid gap-4">
          {/* Google sign up button */}
          <Button
            variant="outline"
            onClick={handleGoogleSignUp}
            fullWidth
            disabled={isLoading !== null}
            isLoading={isLoading === "google"}
          >
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
          {/* Email/password sign up form */}
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading !== null}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
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
              <PasswordField
                id="password"
                name="password"
                label="Password"
                required
                disabled={isLoading !== null}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordTouched(true);
                }}
                onBlur={() => setPasswordTouched(true)}
                autoComplete="new-password webauthn"
              />
              <PasswordStrengthMeter
                password={password}
                touched={passwordTouched}
                confirmPassword={confirmPassword}
                confirmTouched={confirmTouched}
              />
              {/* Password requirements checklist */}
              {passwordTouched && (
                <ul className="mt-2 text-xs space-y-1">
                  <li className="flex items-center gap-2">
                    {passwordReqs.minLength ? (
                      <span className="text-green-600">✔️</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordReqs.hasUpper ? (
                      <span className="text-green-600">✔️</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordReqs.hasSpecial ? (
                      <span className="text-green-600">✔️</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                    One special character
                  </li>
                </ul>
              )}
              {/* Password strength meter (text) */}
              {passwordTouched && (
                <div
                  className={`text-xs mt-1 ${passwordStrength.level === "Strong" ? "text-green-600" : passwordStrength.level === "Medium" ? "text-yellow-600" : "text-red-600"}`}
                >
                  Password strength: {passwordStrength.level}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                required
                disabled={isLoading !== null}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmTouched(true);
                }}
                onBlur={() => setConfirmTouched(true)}
                autoComplete="new-password webauthn"
              />
            </div>
            <Button type="submit" fullWidth disabled={isLoading !== null}>
              {isLoading === "email" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign up with Email"
              )}
            </Button>
          </form>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Button
            variant="text"
            href={
              inviteToken
                ? `/auth/signin?inviteToken=${inviteToken}`
                : "/auth/signin"
            }
          >
            Sign in
          </Button>
        </div>
      </Card>
    </div>
  );
}

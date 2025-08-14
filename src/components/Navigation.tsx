"use client";

import { useState } from "react";
import Button from "./Button";
import Avatar from "./Avatar";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  HomeIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function Navigation() {
  const { data: session } = authClient.useSession();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setSignOutError(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setSignOutError("Failed to sign out. Please try again.");
    }
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-accent-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
              aria-label="Homepage"
            >
              <span className="text-2xl font-bold text-primary-600">BBB</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-3">
            {session ? (
              <>
                <Button
                  variant="primary"
                  href="/dashboard"
                  className="text-sm px-3 py-1.5 h-8"
                >
                  Dashboard
                </Button>
                <Button
                  variant="text"
                  onClick={handleSignOut}
                  className="text-sm px-3 py-1.5 h-8"
                >
                  Sign Out
                </Button>
                <Avatar
                  src={session.user?.image || undefined}
                  name={session.user?.name || "User"}
                  size={32}
                  className="cursor-pointer hover:opacity-80 transition-opacity ml-1"
                />
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  href="/auth/signin"
                  className="text-sm px-3 py-1.5 h-8"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  href="/auth/signup"
                  className="text-sm px-3 py-1.5 h-8"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center space-x-2">
            {session ? (
              <>
                {/* Mobile Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  aria-label="Go to Dashboard"
                >
                  <HomeIcon className="w-5 h-5" />
                </Link>

                {/* Mobile Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Sign Out"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>

                {/* Mobile Avatar */}
                <Avatar
                  src={session.user?.image || undefined}
                  name={session.user?.name || "User"}
                  size={28}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </>
            ) : (
              <>
                {/* Mobile Sign In Link */}
                <Link
                  href="/auth/signin"
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>

                {/* Mobile Sign Up Button */}
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label="Sign Up"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Error Message Display */}
        {signOutError && (
          <div className="absolute top-16 left-0 right-0 bg-red-50 border-b border-red-200 px-4 py-2">
            <p className="text-red-600 text-sm text-center">{signOutError}</p>
          </div>
        )}
      </div>
    </nav>
  );
}

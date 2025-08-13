import Button from "./Button";
import Link from "next/link";

export default function Navigation() {
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
          <div className="flex items-center space-x-4">
            <Button variant="text" href="/auth/signin">
              Sign In
            </Button>
            <Button variant="primary" href="/auth/signup">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

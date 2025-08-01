import { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-pastel-gradient">
      <div className="mx-auto max-w-4xl py-8 px-4">{children}</div>
    </div>
  );
}

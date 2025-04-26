"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove trailing slash and split path into segments
    const segments = pathname?.split("/").filter(Boolean) || [];

    // Always start with Dashboard
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];

    // Build up breadcrumb paths
    let currentPath = "/dashboard";
    segments.forEach((segment, index) => {
      if (index === 0 && segment === "dashboard") return; // Skip dashboard as it's already added

      currentPath += `/${segment}`;
      // Convert segment to title case and replace hyphens/underscores with spaces
      const label = segment
        .split(/[-_]/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

      breadcrumbs.push({ label, href: currentPath });
    });

    // If we're at the dashboard root, add an "Overview" breadcrumb
    if (segments.length <= 1 && segments[0] === "dashboard") {
      breadcrumbs.push({ label: "Overview", href: "/dashboard" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center">
            {index > 0 && (
              <svg
                className="h-5 w-5 text-secondary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <Link
              href={item.href}
              className={`ml-2 text-sm font-medium ${
                index === breadcrumbs.length - 1
                  ? "text-secondary-500"
                  : "text-primary-500 hover:text-primary-600"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

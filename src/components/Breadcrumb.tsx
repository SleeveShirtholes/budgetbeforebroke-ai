"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
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
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
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

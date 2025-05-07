"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Breadcrumb Component
 *
 * A navigation component that displays the current page's location in the site hierarchy.
 * It automatically generates breadcrumb items based on the current URL path.
 *
 * Features:
 * - Automatically generates breadcrumb items from the current URL path
 * - Handles special cases for dashboard routes
 * - Converts URL segments to readable labels
 * - Provides clickable navigation links
 * - Shows visual separators between items
 *
 * @returns {JSX.Element} A navigation component with breadcrumb items
 */
export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove trailing slash and split path into segments
    const segments = pathname?.split("/").filter(Boolean) || [];

    const breadcrumbs = [];
    let currentPath = "";

    // Handle dashboard as the root path
    if (segments[0] === "dashboard") {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
      currentPath = "/dashboard";
    } else {
      // For non-dashboard routes, show Home as the root
      breadcrumbs.push({ label: "Home", href: "/dashboard" });
    }

    // Process each path segment to create breadcrumb items
    segments.forEach((segment, index) => {
      // Skip dashboard as it's already added
      if (index === 0 && segment === "dashboard") return;

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

    // Add "Overview" breadcrumb for dashboard root
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
            {/* Add chevron separator between items */}
            {index > 0 && (
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
            )}
            <Link
              href={item.href}
              className={`ml-2 text-sm font-medium ${
                index === breadcrumbs.length - 1
                  ? "text-secondary-500" // Current page styling
                  : "text-primary-500 hover:text-primary-600" // Link styling
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

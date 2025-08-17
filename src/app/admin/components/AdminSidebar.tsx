"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  TableCellsIcon,
  EnvelopeIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  {
    name: "Contact Submissions",
    href: "/admin/contact-submissions",
    icon: EnvelopeIcon,
  },
  { name: "Database Tables", href: "/admin/tables", icon: TableCellsIcon },
  { name: "Users", href: "/admin/tables/user", icon: UsersIcon },
  {
    name: "Budget Accounts",
    href: "/admin/tables/budgetAccounts",
    icon: BanknotesIcon,
  },
  {
    name: "Transactions",
    href: "/admin/tables/transactions",
    icon: CreditCardIcon,
  },
  {
    name: "Support Requests",
    href: "/admin/tables/supportRequests",
    icon: DocumentTextIcon,
  },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/admin/settings", icon: CogIcon },
];

/**
 * Admin sidebar component providing navigation for the admin panel
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block hidden">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">
            Admin Panel
          </span>
        </Link>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 group-hover:text-gray-600",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

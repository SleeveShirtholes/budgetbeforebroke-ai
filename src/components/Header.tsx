"use client";

import {
  NavDropdownWithReactIcon,
  getNavigationData,
} from "@/utils/navigationLoader";
import {
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

import Avatar from "@/components/Avatar";
import { authClient } from "@/lib/auth-client";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Header component that displays the main navigation bar with dropdown menus and user profile.
 *
 * @component
 * @returns {JSX.Element} A responsive header with navigation dropdowns and user profile menu
 */
export default function Header() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigationData, setNavigationData] = useState<
    Record<string, NavDropdownWithReactIcon>
  >({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { data: session } = authClient.useSession();

  // Only use the session user image if it exists
  const userAvatar = session?.user?.image || undefined;
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@example.com";

  useEffect(() => {
    async function loadNavigationData() {
      try {
        const data = await getNavigationData();
        setNavigationData(data);
      } catch (error) {
        console.error("Failed to load navigation data:", error);
      }
    }
    loadNavigationData();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close nav dropdowns when clicking outside
      if (openDropdown) {
        const currentRef = dropdownRefs.current[openDropdown];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }

      // Close user dropdown when clicking outside
      if (
        isUserDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }

      // Close mobile menu when clicking outside
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, isUserDropdownOpen, isMobileMenuOpen]);

  // Toggle dropdown on click
  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  // Save dropdown refs
  const setDropdownRef = (el: HTMLDivElement | null, key: string) => {
    if (dropdownRefs.current) {
      dropdownRefs.current[key] = el;
    }
  };

  /**
   * Handles user sign out and redirects to the login page on success.
   */
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
        },
      },
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-sm z-50 border-b border-accent-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl sm:text-2xl font-bold text-primary-500 truncate"
            >
              BudgetBeforeBroke
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-10 lg:flex lg:space-x-8">
              {(
                Object.entries(navigationData) as [
                  string,
                  NavDropdownWithReactIcon,
                ][]
              ).map(([key, dropdown]) => (
                <div
                  key={key}
                  className="relative"
                  ref={(el) => setDropdownRef(el, key)}
                >
                  <button
                    onClick={() => toggleDropdown(key)}
                    className={`flex items-center space-x-2 text-sm font-medium ${
                      openDropdown === key
                        ? "text-primary-500"
                        : "text-secondary-700 hover:text-primary-500"
                    }`}
                  >
                    <span>{dropdown.label}</span>
                    <ChevronDownIcon
                      className={`ml-1 h-5 w-5 transition-transform duration-200 ${
                        openDropdown === key ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === key && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-sm bg-white border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                      <div className="py-2 px-1" role="menu">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center px-4 py-3 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="flex-shrink-0 mr-3 p-1 rounded-full bg-gray-50 text-gray-400 group-hover:text-primary-500">
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-secondary-700 hover:text-primary-500 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* User dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 focus:outline-none"
              >
                <Avatar src={userAvatar} name={userName} size={32} />
                <ChevronDownIcon
                  className={`hidden sm:block h-5 w-5 transition-transform duration-200 ${
                    isUserDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-sm bg-white border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                  <div className="py-2 px-1" role="menu">
                    <Link
                      href="/profile"
                      className="group flex items-center px-4 py-2 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                      Profile
                    </Link>
                  </div>
                  <div className="py-2 px-1" role="menu">
                    <button
                      type="button"
                      className="group flex items-center px-4 py-2 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      role="menuitem"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-accent-200 py-4 bg-white/95 backdrop-blur-sm"
          >
            <nav className="space-y-4">
              {(
                Object.entries(navigationData) as [
                  string,
                  NavDropdownWithReactIcon,
                ][]
              ).map(([key, dropdown]) => (
                <div key={key} className="space-y-2">
                  <div className="font-medium text-secondary-800 px-4 py-2 text-sm">
                    {dropdown.label}
                  </div>
                  <div className="space-y-1">
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md mx-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex-shrink-0 mr-3 p-1 rounded-full bg-gray-50 text-gray-400 group-hover:text-primary-500">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

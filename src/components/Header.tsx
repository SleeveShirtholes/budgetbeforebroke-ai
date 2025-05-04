"use client";

import {
  NavDropdownWithReactIcon,
  getNavigationData,
} from "@/utils/navigationLoader";
import { useEffect, useRef, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  userAvatar?: string;
  userName?: string;
}

export default function Header({
  userAvatar = "/default-avatar.png",
  userName = "User",
}: HeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [navigationData, setNavigationData] = useState<
    Record<string, NavDropdownWithReactIcon>
  >({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

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
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, isUserDropdownOpen]);

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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-sm z-50 border-b border-accent-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-primary-500"
            >
              BudgetBeforeBroke
            </Link>
            <nav className="ml-10 flex space-x-8">
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

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-secondary-700">{userName}</span>
              <ChevronDownIcon
                className={`ml-1 h-5 w-5 transition-transform duration-200 ${
                  isUserDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-sm bg-white border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    user@example.com
                  </p>
                </div>
                <div className="py-2 px-1" role="menu">
                  <Link
                    href="/dashboard/profile"
                    className="group flex items-center px-4 py-2 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="group flex items-center px-4 py-2 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                </div>
                <div className="py-2 px-1" role="menu">
                  <Link
                    href="/logout"
                    className="group flex items-center px-4 py-2 mx-1 my-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

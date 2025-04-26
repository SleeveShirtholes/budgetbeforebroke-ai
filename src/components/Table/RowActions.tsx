"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Renders a dropdown menu of actions for a table row.
 *
 * @param {Object} props - The component props
 * @param {Array<{label: string, icon?: ReactNode, onClick: () => void}>} props.actions - Array of action items
 * @param {string} props.actions[].label - Display text for the action
 * @param {ReactNode} [props.actions[].icon] - Optional icon to display with the action
 * @param {() => void} props.actions[].onClick - Function to execute when action is clicked
 */

interface Action {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface RowActionsProps {
  actions: Action[];
}

export default function RowActions({ actions }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionRef.current &&
        !actionRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Don't render anything if there are no actions
  if (actions.length === 0) return null;

  return (
    <div
      className="relative inline-block"
      ref={actionRef}
      style={{ zIndex: isOpen ? 9999 : "auto" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-full transition-colors ${
          isOpen
            ? "bg-secondary-100 text-secondary-800"
            : "hover:bg-secondary-100 text-secondary-600"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="rounded-md shadow-lg bg-white border border-gray-200 overflow-hidden"
          style={{
            position: "fixed",
            zIndex: 9999,
            width: "160px",
            top: actionRef.current
              ? actionRef.current.getBoundingClientRect().bottom + 4
              : 0,
            right: actionRef.current
              ? window.innerWidth -
                actionRef.current.getBoundingClientRect().right
              : 0,
          }}
        >
          <div className="py-1" role="menu">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 flex items-center space-x-2 group"
                role="menuitem"
              >
                {action.icon && (
                  <span className="text-secondary-600 group-hover:text-primary-600 transition-colors">
                    {action.icon}
                  </span>
                )}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

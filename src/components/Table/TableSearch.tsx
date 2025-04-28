"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

/**
 * A search input component for filtering table data globally.
 *
 * @param {Object} props - The component props
 * @param {string} props.value - Current search query value
 * @param {(value: string) => void} props.onChange - Callback when search query changes
 */

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

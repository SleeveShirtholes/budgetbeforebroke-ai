import Card from "@/components/Card";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState } from "react";

interface PageInfoProps {
  title?: string;
  content: ReactNode;
}

/**
 * A reusable component that displays a help tooltip with page information.
 * Works on both desktop (hover) and mobile (click) devices.
 *
 * @param {string} title - Optional title for the tooltip content
 * @param {ReactNode} content - The content to display in the tooltip
 * @returns {JSX.Element} A help tooltip with the specified content
 */
export default function PageInfo({
  title = "How to use this page:",
  content,
}: PageInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-secondary-400 hover:text-secondary-600 transition-colors cursor-pointer"
        aria-label="Toggle page information"
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Page Info</span>
      </button>

      {/* Desktop: Hover-based tooltip */}
      <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block lg:block">
        <Card className="w-96 bg-white border border-secondary-200 shadow-xl rounded-2xl p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-600">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 text-secondary-400 hover:text-secondary-600"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <hr className="border-t border-secondary-200 mb-2" />
            {content}
          </div>
        </Card>
      </div>

      {/* Mobile: Click-based modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary-600">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-secondary-400 hover:text-secondary-600"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <hr className="border-t border-secondary-200 mb-4" />
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

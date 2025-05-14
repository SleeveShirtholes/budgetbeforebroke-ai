import Card from "@/components/Card";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

interface PageInfoProps {
  title?: string;
  content: ReactNode;
}

/**
 * A reusable component that displays a help tooltip with page information.
 *
 * @param {string} title - Optional title for the tooltip content
 * @param {ReactNode} content - The content to display in the tooltip
 * @returns {JSX.Element} A help tooltip with the specified content
 */
export default function PageInfo({
  title = "How to use this page:",
  content,
}: PageInfoProps) {
  return (
    <div className="relative group">
      <div className="flex items-center space-x-1 text-secondary-400 hover:text-secondary-600 transition-colors">
        <QuestionMarkCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Page Info</span>
      </div>
      <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block">
        <Card className="w-96 bg-white border border-secondary-200 shadow-xl rounded-2xl p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-600">{title}</h3>
            <hr className="border-t border-secondary-200 mb-2" />
            {content}
          </div>
        </Card>
      </div>
    </div>
  );
}

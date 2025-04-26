"use client";

/**
 * Renders pagination controls for the table including page navigation and pagination toggle.
 *
 * @param {Object} props - The component props
 * @param {number} props.currentPage - Current active page number
 * @param {number} props.totalPages - Total number of pages
 * @param {(page: number) => void} props.onPageChange - Callback when page changes
 * @param {boolean} props.showPagination - Whether pagination is enabled
 * @param {() => void} props.togglePagination - Function to toggle pagination on/off
 */

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPagination: boolean;
  togglePagination: () => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Calculate which page numbers to show
  let pagesToShow: (number | string)[] = [];

  if (totalPages <= 7) {
    // If 7 or fewer pages, show all
    pagesToShow = pageNumbers;
  } else {
    // Always include first and last page
    if (currentPage <= 3) {
      // Near the start
      pagesToShow = [1, 2, 3, 4, 5, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pagesToShow = [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      // Middle case with dots on both sides
      pagesToShow = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  }

  return (
    <div className="flex justify-center items-center space-x-1">
      {/* Previous page button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`px-3 py-2 rounded-md flex items-center ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-secondary-50"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Page numbers */}
      {pagesToShow.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page
                ? "bg-primary-600 text-white"
                : "text-gray-700 hover:bg-secondary-50"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 py-1 text-gray-500">
            {page}
          </span>
        ),
      )}

      {/* Next page button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`px-3 py-2 rounded-md flex items-center ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-secondary-50"
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

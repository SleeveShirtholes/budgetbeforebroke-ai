"use client";

import { useState, useRef, useEffect } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/20/solid";
import HighlightedText from "./HighlightedText";

interface TruncatedCellProps {
  content: string;
  maxWidth?: number;
  className?: string;
  searchQuery?: string;
}

/**
 * A table cell component that truncates long content and provides a tooltip with copy functionality
 * @param content - The text content to display
 * @param maxWidth - Maximum width before truncation (default: 200px)
 * @param className - Additional CSS classes
 * @param searchQuery - Optional search query to highlight matching text
 */
export default function TruncatedCell({
  content,
  maxWidth = 200,
  className = "",
  searchQuery,
}: TruncatedCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check if content is actually truncated
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringTooltip) {
        setShowTooltip(false);
      }
    }, 150); // Small delay to allow moving to tooltip
  };

  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    setShowTooltip(false);
  };

  const shouldShowTooltip = isTruncated && (showTooltip || isHoveringTooltip);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative group">
      <div
        ref={textRef}
        className={`truncate overflow-hidden ${className}`}
        style={{ maxWidth: `${maxWidth}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {searchQuery ? (
          <HighlightedText text={content} highlight={searchQuery} />
        ) : (
          content
        )}
      </div>

      {/* Tooltip */}
      {shouldShowTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs break-words"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex-1">{content}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-400" />
              ) : (
                <ClipboardDocumentIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

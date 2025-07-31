"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { XMarkIcon } from "@heroicons/react/20/solid";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  footerButtons?: React.ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
  footerButtons,
}: ModalProps) {
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      // Reset the auto-select flag when modal closes
      hasAutoSelected.current = false;
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            data-testid="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-0 left-0 w-screen h-screen bg-gray-500/30 z-40"
          />

          {/* Modal */}
          <div className="fixed top-0 left-0 w-screen h-screen z-50 overflow-y-auto">
            <div
              className="flex min-h-[100vh] items-start justify-center p-2 sm:p-4 pt-16 sm:pt-24"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              <motion.div
                data-testid="modal-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`relative w-full ${maxWidthClasses[maxWidth]} max-w-[calc(100vw-1rem)] sm:max-w-none bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full p-1 flex-shrink-0"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {children}
                </div>

                {/* Footer */}
                {footerButtons && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white">
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                      {footerButtons}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

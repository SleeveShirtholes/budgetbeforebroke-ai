import React, { useEffect, useRef } from "react";

/**
 * Tabs Component
 *
 * A reusable, accessible tab switcher for toggling between views or filters.
 *
 * @param {Array<{ label: string; value: string }>} options - The tab options to display
 * @param {string} value - The currently selected tab value
 * @param {(value: string) => void} onChange - Handler called when a tab is selected
 * @param {string} [className] - Optional additional class names
 */
export interface TabOption {
    label: string;
    value: string;
}

interface TabsProps {
    options: TabOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ options, value, onChange, className = "" }) => {
    // Refs for each tab button
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Focus the active tab when value changes
    useEffect(() => {
        const activeIndex = options.findIndex((option) => option.value === value);
        if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
            tabRefs.current[activeIndex]?.focus();
        }
    }, [value, options]);

    /**
     * Handles left/right arrow key navigation between tabs
     * @param event Keyboard event
     * @param currentValue The value of the currently focused tab
     */
    const handleKeyDown = (event: React.KeyboardEvent, currentValue: string) => {
        const currentIndex = options.findIndex((option) => option.value === currentValue);
        if (event.key === "ArrowRight") {
            const nextIndex = (currentIndex + 1) % options.length;
            onChange(options[nextIndex].value);
        } else if (event.key === "ArrowLeft") {
            const prevIndex = (currentIndex - 1 + options.length) % options.length;
            onChange(options[prevIndex].value);
        }
    };

    return (
        <div className={`inline-flex rounded-lg bg-gray-100 p-1 ${className}`} role="tablist">
            {options.map((option, idx) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors
              ${isActive ? "bg-primary-600 text-white shadow" : "bg-transparent text-primary-700 hover:bg-primary-50"}
            `}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(e) => handleKeyDown(e, option.value)}
                        ref={(el) => {
                            tabRefs.current[idx] = el;
                        }}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;

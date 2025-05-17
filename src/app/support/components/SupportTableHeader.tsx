import CustomSelect, { SelectOption } from "@/components/Forms/CustomSelect";

import React from "react";

/**
 * Props for the SupportTableHeader component
 * @interface SupportTableHeaderProps
 * @property {string} tableTitle - The title to display above the table
 * @property {("open" | "closed")} statusView - The current status filter value
 * @property {(value: "open" | "closed") => void} onStatusViewChange - Callback when the status filter changes
 */
interface SupportTableHeaderProps {
    tableTitle: string;
    statusView: "open" | "closed";
    onStatusViewChange: (value: "open" | "closed") => void;
}

/**
 * Options for the status filter dropdown
 * @constant
 */
const statusDropdownOptions: SelectOption[] = [
    { label: "Open & In Progress", value: "open" },
    { label: "Closed", value: "closed" },
];

/**
 * SupportTableHeader Component
 *
 * Renders the header section above the support requests table, including:
 * - A dynamic title that reflects the current view and filter state
 * - A dropdown to filter requests by status (Open/In Progress vs Closed)
 *
 * The component is responsive and will stack vertically on mobile devices.
 *
 * @param {SupportTableHeaderProps} props - The component props
 * @returns {JSX.Element} A container with title and status filter
 */
const SupportTableHeader: React.FC<SupportTableHeaderProps> = ({ tableTitle, statusView, onStatusViewChange }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h2 className="text-2xl font-semibold text-gray-700">{tableTitle}</h2>
        <CustomSelect
            options={statusDropdownOptions}
            value={statusView}
            onChange={(val) => onStatusViewChange(val as "open" | "closed")}
            id="status-dropdown"
            aria-label="Status Filter"
            fullWidth={false}
        />
    </div>
);

export default SupportTableHeader;

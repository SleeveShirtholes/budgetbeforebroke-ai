import Tabs, { TabOption } from "@/components/Tabs";

import Button from "@/components/Button";
import React from "react";

/**
 * Props for the SupportFilters component
 * @interface SupportFiltersProps
 * @property {("my" | "public")} issueView - The current view mode (my issues or public issues)
 * @property {(value: "my" | "public") => void} onIssueViewChange - Callback when the view mode changes
 * @property {() => void} onCreateRequest - Callback when the create request button is clicked
 */
interface SupportFiltersProps {
  issueView: "my" | "public";
  onIssueViewChange: (value: "my" | "public") => void;
  onCreateRequest: () => void;
}

/**
 * Tab options for the main filter
 * @constant
 */
const mainTabOptions: TabOption[] = [
  { label: "My Issues", value: "my" },
  { label: "All Public Issues", value: "public" },
];

/**
 * SupportFilters Component
 *
 * Renders the filter controls for the support page, including:
 * - Tabs to switch between "My Issues" and "All Public Issues"
 * - A button to create new support requests
 *
 * The component is responsive and will stack vertically on mobile devices.
 *
 * @param {SupportFiltersProps} props - The component props
 * @returns {JSX.Element} A container with tabs and create button
 */
const SupportFilters: React.FC<SupportFiltersProps> = ({
  issueView,
  onIssueViewChange,
  onCreateRequest,
}) => (
  <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <Tabs
      options={mainTabOptions}
      value={issueView}
      onChange={(val) => onIssueViewChange(val as "my" | "public")}
    />
    <Button variant="primary" onClick={onCreateRequest}>
      Create New Support Request
    </Button>
  </div>
);

export default SupportFilters;

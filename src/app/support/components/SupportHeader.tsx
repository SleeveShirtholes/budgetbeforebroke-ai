import React from "react";

/**
 * SupportHeader Component
 *
 * Displays the main header section of the support page, including the title and description.
 * This component is purely presentational and has no state or props.
 *
 * @returns {JSX.Element} A header element containing the support center title and description
 */
const SupportHeader: React.FC = () => (
  <header className="mb-8">
    <h1 className="text-3xl font-bold text-gray-800">Support Center</h1>
    <p className="text-gray-600 mt-1">
      Track your support requests or create a new one.
    </p>
  </header>
);

export default SupportHeader;

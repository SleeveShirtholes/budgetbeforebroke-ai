/**
 * A component that highlights matching text within a string based on a search query.
 *
 * @component
 * @param {string} text - The original text to be displayed and potentially highlighted
 * @param {string} searchQuery - The search term to highlight within the text
 * @returns {JSX.Element} The text with matching search terms highlighted in yellow
 */
interface HighlightedTextProps {
  text: string;
  searchQuery: string;
}

// Function to escape special regex characters
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const HighlightedText = ({
  text,
  searchQuery,
}: HighlightedTextProps) => {
  // If no search query is provided, return the original text without highlighting
  if (!searchQuery) return <>{text}</>;

  // Create a case-insensitive regex pattern from the escaped search query
  const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, "gi");

  // Split the text by the regex pattern and map each part
  // If the part matches the search query, wrap it in a highlighted span
  return (
    <>
      {text.split(regex).map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

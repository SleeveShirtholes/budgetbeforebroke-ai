/**
 * A component that highlights specified text within a string.
 *
 * @param {string | null | undefined} text - The text to be displayed and potentially highlighted
 * @param {string} highlight - The text to highlight within the main text
 * @returns {JSX.Element} A span element containing the text with highlighted portions
 */
interface HighlightedTextProps {
  text: string | null | undefined;
  highlight: string;
}

export default function HighlightedText({
  text,
  highlight,
}: HighlightedTextProps) {
  // Return empty span if text is null or undefined
  if (!text) {
    return <span data-testid="empty-span" />;
  }

  // Return unhighlighted text if highlight is empty or only whitespace
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  // Create case-insensitive regex to match highlight text
  const regex = new RegExp(`(${highlight})`, "gi");
  // Split text into parts based on highlight matches
  const parts = text.toString().split(regex);

  // Render text with highlighted portions
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

import React, { useState } from "react";

import Image from "next/image";

interface AvatarProps {
    src?: string;
    alt?: string;
    name: string;
    size?: number;
    className?: string;
    onClick?: () => void;
}

/**
 * Extracts the first letter of each word in a name and returns them as uppercase initials
 * @param name - The full name to extract initials from
 * @returns A string containing up to 2 uppercase initials
 */
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Avatar component that displays either an image or initials in a circular container
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.src] - URL of the avatar image
 * @param {string} [props.alt] - Alt text for the image (falls back to name if not provided)
 * @param {string} props.name - Full name of the user (used for initials fallback)
 * @param {number} [props.size=40] - Size of the avatar in pixels
 * @param {string} [props.className=""] - Additional CSS classes to apply
 * @param {() => void} [props.onClick] - Optional click handler
 * @returns {JSX.Element} A circular avatar component
 */
const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 40, className = "", onClick }) => {
    // State to track if the image failed to load
    const [imgError, setImgError] = useState(false);
    // Get initials from the name for fallback display
    const initials = getInitials(name);

    return (
        <div
            className={`rounded-full bg-primary-100 flex items-center justify-center overflow-hidden ${className}`}
            style={{ width: size, height: size }}
            onClick={onClick}
        >
            {src && !imgError ? (
                <Image
                    src={src}
                    alt={alt || name}
                    width={size}
                    height={size}
                    className="object-cover w-full h-full"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="text-primary-700 font-semibold text-base select-none">{initials}</span>
            )}
        </div>
    );
};

export default Avatar;

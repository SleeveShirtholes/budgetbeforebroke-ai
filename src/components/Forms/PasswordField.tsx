import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import TextField, { TextFieldProps } from "./TextField";

/**
 * PasswordField - A reusable password input with show/hide toggle, using TextField for consistent styling
 */
const PasswordField = React.forwardRef<
  HTMLInputElement,
  Omit<TextFieldProps, "type" | "endAdornment">
>(({ label, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <TextField
      ref={ref}
      label={label}
      type={show ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      }
      {...props}
    />
  );
});

PasswordField.displayName = "PasswordField";

export default PasswordField;

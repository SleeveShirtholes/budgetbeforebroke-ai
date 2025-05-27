import React from "react";

function getPasswordStrength(password: string) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!minLength) return { level: "Weak", valid: false } as const;
    if (minLength && hasUpper && hasSpecial) return { level: "Strong", valid: true } as const;
    if (minLength && (hasUpper || hasSpecial)) return { level: "Medium", valid: false } as const;
    return { level: "Weak", valid: false } as const;
}

function getPasswordRequirements(password: string) {
    return {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
}

interface PasswordStrengthMeterProps {
    password: string;
    touched?: boolean;
    confirmPassword?: string;
    confirmTouched?: boolean;
}

/**
 * PasswordStrengthMeter - Shows a strength bar, requirements checklist, and strength text for a password
 * Also shows a warning if confirmPassword is provided and does not match password.
 */
const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    password,
    touched = true,
    confirmPassword,
    confirmTouched,
}) => {
    const passwordStrength = getPasswordStrength(password);
    const passwordReqs = getPasswordRequirements(password);
    const passwordsMatch = confirmPassword === undefined || password === confirmPassword;

    if (!touched) return null;

    return (
        <>
            {/* Password strength bar */}
            <div className="w-full h-2 mt-2 rounded bg-gray-200">
                <div
                    className={
                        passwordStrength.level === "Strong"
                            ? "bg-green-500"
                            : passwordStrength.level === "Medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                    }
                    style={{
                        width:
                            passwordStrength.level === "Strong"
                                ? "100%"
                                : passwordStrength.level === "Medium"
                                  ? "66%"
                                  : password.length > 0
                                    ? "33%"
                                    : "0%",
                        height: "100%",
                        borderRadius: 4,
                        transition: "width 0.3s, background-color 0.3s",
                    }}
                />
            </div>
            {/* Password requirements checklist */}
            <ul className="mt-2 text-xs space-y-1">
                <li className="flex items-center gap-2">
                    {passwordReqs.minLength ? (
                        <span className="text-green-600">✔️</span>
                    ) : (
                        <span className="text-red-600">❌</span>
                    )}
                    At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                    {passwordReqs.hasUpper ? (
                        <span className="text-green-600">✔️</span>
                    ) : (
                        <span className="text-red-600">❌</span>
                    )}
                    One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                    {passwordReqs.hasSpecial ? (
                        <span className="text-green-600">✔️</span>
                    ) : (
                        <span className="text-red-600">❌</span>
                    )}
                    One special character
                </li>
            </ul>
            {/* Password strength meter (text) */}
            <div
                className={`text-xs mt-1 ${
                    passwordStrength.level === "Strong"
                        ? "text-green-600"
                        : passwordStrength.level === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                }`}
            >
                Password strength: {passwordStrength.level}
            </div>
            {/* Passwords match warning */}
            {confirmPassword !== undefined && confirmTouched && !passwordsMatch && (
                <div className="text-xs mt-1 text-red-600">Passwords do not match.</div>
            )}
        </>
    );
};

export default PasswordStrengthMeter;

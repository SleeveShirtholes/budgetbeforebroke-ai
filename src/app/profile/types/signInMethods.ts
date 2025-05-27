/**
 * Interface representing a sign-in method used by a user
 * @interface SignInMethod
 * @property {string} type - The type of sign-in method (e.g., 'password', 'oauth')
 * @property {string} provider - The provider of the sign-in method (e.g., 'Google', 'Email')
 * @property {string} lastUsed - The timestamp of when this method was last used
 * @property {string} id - The unique identifier for the sign-in method
 */
export interface SignInMethod {
    type: string;
    provider: string;
    lastUsed: string;
    id: string;
}

/**
 * Props for the SignInMethodCard component
 * @interface SignInMethodCardProps
 * @property {SignInMethod} method - The sign-in method to display
 * @property {() => void} onDelete - Callback when the delete button is clicked
 */
export interface SignInMethodCardProps {
    method: SignInMethod;
    onDelete: () => void;
}

/**
 * Props for the AddGoogleAccountCard component
 * @interface AddGoogleAccountCardProps
 * @property {boolean} isLoading - Whether the Google account linking is in progress
 * @property {() => void} onAdd - Callback when the connect button is clicked
 */
export interface AddGoogleAccountCardProps {
    isLoading: boolean;
    onAdd: () => void;
}

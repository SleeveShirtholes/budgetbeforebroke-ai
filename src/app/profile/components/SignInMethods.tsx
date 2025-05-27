"use client";

import { addGoogleAccount, deleteSignInMethod, getSignInMethods } from "../actions";

import AddGoogleAccountCard from "./AddGoogleAccountCard";
import DeleteMethodModal from "./DeleteMethodModal";
import { SignInMethod } from "../types/signInMethods";
import SignInMethodCard from "./SignInMethodCard";
import { authClient } from "@/lib/auth-client";
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/components/Toast";

/**
 * SignInMethods Component
 *
 * Displays a list of user's sign-in methods with their providers and last used timestamps.
 * Each method is displayed in a card format with a delete button.
 * Also provides the ability to add a Google account if one isn't already connected.
 *
 * @component
 * @returns {JSX.Element} A list of sign-in method cards and a Google account connection option
 */
export default function SignInMethods() {
    // Fetch sign-in methods using SWR
    const { data: methods, error, mutate } = useSWR<SignInMethod[]>("signInMethods", getSignInMethods);

    // State for managing method deletion
    const [methodToDelete, setMethodToDelete] = useState<SignInMethod | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for managing Google account addition
    const [isAddingGoogle, setIsAddingGoogle] = useState(false);

    // Toast notifications
    const { showToast } = useToast();

    /**
     * Handles the deletion of a sign-in method
     * @returns {Promise<void>}
     */
    const handleDelete = async () => {
        if (!methodToDelete) return;

        setIsDeleting(true);
        try {
            await deleteSignInMethod(methodToDelete.id);
            await mutate();
            showToast("Sign-in method removed successfully", { type: "success" });
        } catch {
            showToast("Failed to remove sign-in method", { type: "error" });
        } finally {
            setIsDeleting(false);
            setMethodToDelete(null);
        }
    };

    /**
     * Handles the addition of a Google account
     * @returns {Promise<void>}
     */
    const handleAddGoogle = async () => {
        setIsAddingGoogle(true);
        try {
            await addGoogleAccount();
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/profile",
            });
            if (error?.message) {
                showToast(error.message, { type: "error" });
                return;
            }
        } catch (error) {
            if (error instanceof Error && error.message === "Google account already linked") {
                showToast("Google account already linked", { type: "error" });
            } else {
                showToast("Failed to add Google account", { type: "error" });
            }
        } finally {
            setIsAddingGoogle(false);
        }
    };

    // Show error state if methods failed to load
    if (error) {
        return <div className="text-red-600">Failed to load sign-in methods. Please try again later.</div>;
    }

    // Show loading state while methods are being fetched
    if (!methods) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-secondary-100 rounded-lg" />
                ))}
            </div>
        );
    }

    // Check if user already has a Google account
    const hasGoogleAccount = methods.some((method) => method.provider.toLowerCase() === "google");

    return (
        <>
            <div role="list" className="space-y-4">
                {/* Display existing sign-in methods */}
                {methods.map((method) => (
                    <SignInMethodCard
                        key={`${method.type}-${method.provider}`}
                        method={method}
                        onDelete={() => setMethodToDelete(method)}
                    />
                ))}

                {/* Display Google account connection option if not already connected */}
                {!hasGoogleAccount && <AddGoogleAccountCard isLoading={isAddingGoogle} onAdd={handleAddGoogle} />}
            </div>

            {/* Delete confirmation modal */}
            <DeleteMethodModal
                method={methodToDelete}
                isDeleting={isDeleting}
                onClose={() => setMethodToDelete(null)}
                onConfirm={handleDelete}
            />
        </>
    );
}

import {
    SupportCategory,
    SupportRequest,
    SupportStatus,
    supportCategoriesOptions,
    supportStatusOptions,
} from "../types";

import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import React from "react";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";

/**
 * Props for the NewRequestModal component
 * @interface NewRequestModalProps
 * @property {boolean} isOpen - Whether the modal is currently open
 * @property {() => void} onClose - Callback when the modal should close
 * @property {(e: React.FormEvent) => void} onSubmit - Callback when the form is submitted
 * @property {Object} newRequest - The current state of the new request form
 * @property {string} newRequest.title - The title of the request
 * @property {string} newRequest.description - The description of the request
 * @property {SupportCategory} newRequest.category - The category of the request
 * @property {SupportStatus} newRequest.status - The status of the request
 * @property {boolean} newRequest.isPublic - Whether the request is public
 * @property {(field: string, value: any) => void} onNewRequestChange - Callback when any form field changes
 */
interface NewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newRequest: {
        title: string;
        description: string;
        category: SupportCategory;
        status: SupportStatus;
        isPublic: boolean;
    };
    onNewRequestChange: (
        field: keyof Omit<SupportRequest, "id" | "lastUpdated" | "comments" | "upvotes" | "downvotes" | "user">,
        value: string | SupportCategory | boolean | SupportStatus
    ) => void;
}

/**
 * NewRequestModal Component
 *
 * A modal dialog for creating new support requests. The form includes:
 * - Title input
 * - Category selection (Feature Request, Issue, General Question)
 * - Status selection (Open, In Progress, Closed)
 * - Description text area
 * - Public/Private toggle
 *
 * The modal includes validation and proper form handling with submit/cancel actions.
 *
 * @param {NewRequestModalProps} props - The component props
 * @returns {JSX.Element} A modal dialog containing the new request form
 */
const NewRequestModal: React.FC<NewRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    newRequest,
    onNewRequestChange,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Support Request"
        maxWidth="lg"
        footerButtons={
            <div className="flex gap-2">
                <Button type="button" onClick={onClose} variant="outline">
                    Cancel
                </Button>
                <Button type="submit" form="new-request-form" variant="primary">
                    Submit Request
                </Button>
            </div>
        }
    >
        <form className="space-y-4" id="new-request-form" data-testid="new-request-form" onSubmit={onSubmit}>
            <TextField
                label="Title"
                id="request-title"
                value={newRequest.title}
                onChange={(e) => onNewRequestChange("title", e.target.value)}
                required
                placeholder="Briefly describe your issue"
            />
            <CustomSelect
                label="Category"
                id="request-category"
                options={supportCategoriesOptions}
                value={newRequest.category}
                onChange={(value) => onNewRequestChange("category", value as SupportCategory)}
                required
            />
            <CustomSelect
                label="Status"
                id="request-status"
                options={supportStatusOptions}
                value={newRequest.status}
                onChange={(value) => onNewRequestChange("status", value as SupportStatus)}
                required
            />
            <TextArea
                label="Description"
                id="request-description"
                value={newRequest.description}
                onChange={(e) => onNewRequestChange("description", e.target.value)}
                required
                rows={5}
                placeholder="Provide a detailed description of the problem or request..."
            />
            <div className="flex items-center mt-4">
                <input
                    id="request-public"
                    type="checkbox"
                    checked={newRequest.isPublic}
                    onChange={(e) => onNewRequestChange("isPublic", e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="request-public" className="ml-2 block text-sm text-gray-900">
                    Make this request public (visible to other users)
                </label>
            </div>
        </form>
    </Modal>
);

export default NewRequestModal;

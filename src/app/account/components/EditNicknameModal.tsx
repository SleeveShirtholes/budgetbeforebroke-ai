import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters.")
    .max(50, "Nickname must be less than 50 characters.")
    .regex(
      /^[A-Za-z0-9\s-_]+$/,
      "Nickname can only contain letters, numbers, spaces, hyphens, and underscores.",
    ),
});

type NicknameFormValues = z.infer<typeof nicknameSchema>;

interface EditNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nickname: string) => Promise<void>;
  nickname: string;
}

/**
 * EditNicknameModal Component
 *
 * A modal dialog that allows users to edit the nickname of an account.
 * Provides a form with nickname input and actions to save changes or cancel.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {() => void} onClose - Callback function to close the modal
 * @param {(nickname: string) => Promise<void>} onSave - Callback function to save the new nickname
 * @param {string} nickname - The current nickname value
 */
export default function EditNicknameModal({
  isOpen,
  onClose,
  onSave,
  nickname,
}: EditNicknameModalProps) {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<NicknameFormValues>({
    resolver: zodResolver(nicknameSchema),
    mode: "onChange",
    defaultValues: { nickname },
  });

  // Update form value when nickname prop changes
  React.useEffect(() => {
    setValue("nickname", nickname);
  }, [nickname, setValue]);

  const onSubmit = async (data: NicknameFormValues) => {
    try {
      await onSave(data.nickname);
      showToast("Nickname updated successfully!", { type: "success" });
      onClose();
    } catch (err) {
      console.error("Failed to update nickname:", err);
      showToast("Failed to update nickname. Please try again.", {
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account Nickname"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <div className="mb-4">
          <TextField
            label="Account Nickname"
            type="text"
            id="nickname"
            {...register("nickname")}
            placeholder="Enter account nickname"
            required
            disabled={isSubmitting}
            error={errors.nickname?.message}
            helperText={errors.nickname?.message}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

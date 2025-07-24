import React from "react";
import TextArea from "@/components/Forms/TextArea";
import Button from "@/components/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Zod schema for validating the add comment form
 */
const addCommentSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
});

type AddCommentFormData = z.infer<typeof addCommentSchema>;

/**
 * AddCommentForm
 *
 * A form component for adding a comment to a support request. Uses react-hook-form and zod for validation.
 *
 * @param onSubmit - Callback when the form is submitted with valid data
 * @param loading - Whether the submit button should show a loading state
 * @param error - Optional error message to display
 * @returns JSX.Element
 */
const AddCommentForm: React.FC<{
  onSubmit: (comment: string) => void;
  loading?: boolean;
  error?: string;
}> = ({ onSubmit, loading = false, error }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCommentFormData>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: { comment: "" },
  });

  const submit = (data: AddCommentFormData) => {
    onSubmit(data.comment);
    reset();
  };

  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit(submit)}
      data-testid="add-comment-form"
    >
      <TextArea
        id="add-comment-textarea"
        label="Your Comment"
        placeholder="Type your comment..."
        rows={3}
        error={errors.comment?.message || error}
        {...register("comment")}
        required
      />
      <Button
        variant="primary"
        size="sm"
        type="submit"
        className="mt-2"
        isLoading={loading || isSubmitting}
        disabled={loading || isSubmitting}
      >
        Submit Comment
      </Button>
    </form>
  );
};

export default AddCommentForm;

import { z } from "zod";

/**
 * Zod schema for debt form validation
 */
export const debtFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  balance: z
    .string()
    .refine(
      (val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0.01 && Number(val) <= 999999999.99),
      { message: "Balance must be a valid number greater than 0 and less than 1 billion" }
    ),
  interestRate: z
    .string()
    .refine(
      (val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      { message: "Interest rate must be a valid number between 0 and 100" }
    ),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Due date must be today or in the future"),
});

/**
 * Zod schema for debt payment form validation
 */
export const debtPaymentFormSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Payment amount must be greater than 0")
    .max(999999999.99, "Payment amount must be less than 1 billion"),
  date: z
    .string()
    .min(1, "Payment date is required"),
  note: z
    .string()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});

/**
 * Type for debt form data
 */
export type DebtFormData = z.infer<typeof debtFormSchema>;

/**
 * Type for debt payment form data
 */
export type DebtPaymentFormData = z.infer<typeof debtPaymentFormSchema>; 
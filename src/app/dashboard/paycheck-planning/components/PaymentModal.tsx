import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import type { DebtInfo, PaycheckInfo } from "@/app/actions/paycheck-planning";
import { formatDateSafely } from "@/utils/date";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentAmount: number, paymentDate: string) => Promise<void>;
  debt: DebtInfo | null;
  paycheck: PaycheckInfo | null;
  isEditing?: boolean;
  currentAmount?: number;
  currentDate?: string;
}

interface PaymentFormData {
  paymentAmount: string;
  paymentDate: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  debt,
  paycheck,
  isEditing = false,
  currentAmount,
  currentDate,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentAmount: debt?.amount?.toString() || "0",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const paymentAmountStr = watch("paymentAmount");
  const paymentAmount = parseFloat(paymentAmountStr) || 0;

  // Reset form when debt changes
  useEffect(() => {
    if (debt) {
      const initialAmount =
        isEditing && currentAmount
          ? currentAmount.toString()
          : debt.amount.toString();
      const initialDate =
        isEditing && currentDate
          ? currentDate
          : format(new Date(), "yyyy-MM-dd");

      reset({
        paymentAmount: initialAmount,
        paymentDate: initialDate,
      });
    }
  }, [debt, reset, isEditing, currentAmount, currentDate]);

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!debt) {
        throw new Error("No debt selected");
      }

      const amount = parseFloat(data.paymentAmount);

      // Validate payment amount
      if (amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      await onConfirm(amount, data.paymentDate);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process payment";
      console.error("Form submission error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!debt || !paycheck) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Payment Details"
      maxWidth="md"
      footerButtons={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="payment-form"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? "Update Payment" : "Confirm Payment"}
          </Button>
        </div>
      }
    >
      <form
        id="payment-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Debt Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Debt Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Debt Name:</span>
              <span className="text-sm font-medium text-gray-900">
                {debt.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Original Amount:</span>
              <span className="text-sm font-medium text-gray-900">
                $
                {(debt.amount && !isNaN(debt.amount)
                  ? debt.amount
                  : 0
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDateSafely(debt.dueDate, "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Paycheck Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Paycheck Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paycheck:</span>
              <span className="text-sm font-medium text-gray-900">
                {paycheck.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pay Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDateSafely(paycheck.date, "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available Amount:</span>
              <span className="text-sm font-medium text-gray-900">
                ${paycheck.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment amount input */}
        <div>
          <label
            htmlFor="displayAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              {...register("paymentAmount", {
                required: "Payment amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
              type="number"
              step="0.01"
              id="displayAmount"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>
          {errors.paymentAmount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.paymentAmount.message}
            </p>
          )}
          {paymentAmount >
            (debt.amount && !isNaN(debt.amount) ? debt.amount : 0) && (
            <p className="mt-1 text-sm text-yellow-600">
              Note: You&apos;re paying more than the payment amount due.
            </p>
          )}
        </div>

        {/* Payment Date */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="paymentDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Date *
            </label>
            <input
              {...register("paymentDate", {
                required: "Payment date is required",
              })}
              type="date"
              id="paymentDate"
              name="paymentDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        {paymentAmount > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  ${paymentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining Debt:</span>
                <span className="text-sm font-medium text-gray-900">
                  $
                  {Math.max(
                    0,
                    (debt.amount && !isNaN(debt.amount) ? debt.amount : 0) -
                      paymentAmount,
                  ).toLocaleString()}
                </span>
              </div>
              {paymentAmount >
                (debt.amount && !isNaN(debt.amount) ? debt.amount : 0) && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Credit Created:</span>
                  <span className="text-sm font-medium text-green-600">
                    $
                    {(
                      paymentAmount -
                      (debt.amount && !isNaN(debt.amount) ? debt.amount : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

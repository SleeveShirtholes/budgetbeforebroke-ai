import { useState } from "react";
import { format } from "date-fns";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Card from "@/components/Card";
import Button from "@/components/Button";
import PaymentModal from "./PaymentModal";
import { formatDateSafely } from "@/utils/date";
import type {
  PaycheckAllocation,
  PaycheckInfo,
  DebtInfo,
} from "@/app/actions/paycheck-planning";

interface DraggablePaycheckCardProps {
  paycheck: PaycheckInfo;
  allocation: PaycheckAllocation;
  unallocatedDebts: DebtInfo[];
  onDebtAllocated: (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  onDebtUnallocated: (debtId: string, paycheckId: string) => Promise<void>;
  onDebtUpdated: (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  onDebtMoved: (
    debtId: string,
    fromPaycheckId: string,
    toPaycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  onMarkPaymentAsPaid?: (debtId: string, paymentId: string) => Promise<void>;
  movingDebtId?: string | null;
}

export default function DraggablePaycheckCard({
  paycheck,
  allocation,
  unallocatedDebts,
  onDebtAllocated,
  onDebtUnallocated,
  onDebtUpdated,
  onDebtMoved,
  onMarkPaymentAsPaid,
  movingDebtId,
}: DraggablePaycheckCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedDebtId, setDraggedDebtId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingDebt, setPendingDebt] = useState<DebtInfo | null>(null);
  const [removingDebtId, setRemovingDebtId] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<{
    debt: DebtInfo;
    currentAmount: number;
    currentDate: string;
  } | null>(null);
  const [moveFromPaycheckId, setMoveFromPaycheckId] = useState<string | null>(
    null,
  );
  const [markingAsPaidId, setMarkingAsPaidId] = useState<string | null>(null);

  const hasInsufficientFunds = allocation.remainingAmount < 0;
  const hasRemainingBalance = allocation.remainingAmount > 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const debtId = e.dataTransfer.getData("debtId");
    const fromPaycheckId = e.dataTransfer.getData("fromPaycheckId");
    const paymentAmount = e.dataTransfer.getData("paymentAmount");
    const paymentDate = e.dataTransfer.getData("paymentDate");
    const debtName = e.dataTransfer.getData("debtName");
    const debtAmount = e.dataTransfer.getData("debtAmount");
    const debtDueDate = e.dataTransfer.getData("debtDueDate");

    if (debtId && draggedDebtId !== debtId) {
      // Check if this debt is being moved from another paycheck
      if (fromPaycheckId && fromPaycheckId !== paycheck.id) {
        // Create a debt object from the drag data
        const debt = {
          id: debtId,
          name: debtName,
          amount: parseFloat(debtAmount),
          dueDate: debtDueDate,
          frequency: "",
          description: "",
          isRecurring: false,
        };

        // Set up editing state with current payment details
        setEditingDebt({
          debt: debt,
          currentAmount: paymentAmount
            ? parseFloat(paymentAmount)
            : parseFloat(debtAmount),
          currentDate: paymentDate || format(new Date(), "yyyy-MM-dd"),
        });
        setMoveFromPaycheckId(fromPaycheckId);
        setIsPaymentModalOpen(true);
      } else {
        // Find the debt in unallocated debts (new allocation)
        const debt = unallocatedDebts.find((d) => d.id === debtId);
        if (debt) {
          setPendingDebt(debt);
          setIsPaymentModalOpen(true);
        }
      }
    }
  };

  const handleDebtDragStart = (e: React.DragEvent, debtId: string) => {
    e.dataTransfer.setData("debtId", debtId);
    e.dataTransfer.setData("fromPaycheckId", paycheck.id);

    // If this is an allocated debt, include its payment details and debt info
    const allocatedDebt = allocation.allocatedDebts.find(
      (d) => d.debtId === debtId,
    );
    if (allocatedDebt) {
      e.dataTransfer.setData("paymentAmount", allocatedDebt.amount.toString());
      e.dataTransfer.setData("paymentDate", allocatedDebt.paymentDate || "");
      e.dataTransfer.setData("debtName", allocatedDebt.debtName);
      e.dataTransfer.setData("debtAmount", allocatedDebt.amount.toString());
      e.dataTransfer.setData("debtDueDate", allocatedDebt.dueDate);
    }

    setDraggedDebtId(debtId);
  };

  const handleDebtDragEnd = () => {
    setDraggedDebtId(null);
  };

  const handleRemoveDebt = async (debtId: string) => {
    setRemovingDebtId(debtId);
    try {
      await onDebtUnallocated(debtId, paycheck.id);
    } finally {
      setRemovingDebtId(null);
    }
  };

  const handlePaymentConfirm = async (
    paymentAmount: number,
    paymentDate: string,
  ) => {
    if (pendingDebt) {
      await onDebtAllocated(
        pendingDebt.id,
        paycheck.id,
        paymentAmount,
        paymentDate,
      );
      setIsPaymentModalOpen(false);
      setPendingDebt(null);
    } else if (editingDebt) {
      // Check if this is a move operation (from another paycheck)
      if (moveFromPaycheckId && moveFromPaycheckId !== paycheck.id) {
        // This is a move operation
        await onDebtMoved(
          editingDebt.debt.id,
          moveFromPaycheckId,
          paycheck.id,
          paymentAmount,
          paymentDate,
        );
      } else {
        // This is an edit operation within the same paycheck
        await onDebtUpdated(
          editingDebt.debt.id,
          paycheck.id,
          paymentAmount,
          paymentDate,
        );
      }

      setIsPaymentModalOpen(false);
      setEditingDebt(null);
      setMoveFromPaycheckId(null);
    }
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false);
    setPendingDebt(null);
    setEditingDebt(null);
    setMoveFromPaycheckId(null);
  };

  const handleEditDebt = (debt: {
    debtId: string;
    debtName: string;
    amount: number;
    dueDate: string;
    paymentDate?: string;
    paymentId?: string;
    isPaid: boolean;
  }) => {
    // Find the debt in unallocated debts to get the full debt info
    const fullDebt = unallocatedDebts.find((d) => d.id === debt.debtId) || {
      id: debt.debtId,
      name: debt.debtName,
      amount: debt.amount,
      dueDate: debt.dueDate,
      frequency: "",
      description: "",
      isRecurring: false,
    };

    setEditingDebt({
      debt: fullDebt,
      currentAmount: debt.amount,
      currentDate: debt.paymentDate || format(new Date(), "yyyy-MM-dd"),
    });
    setIsPaymentModalOpen(true);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Card
        className={`transition-all duration-200 min-h-[200px] ${
          isDragOver ? "bg-blue-50 shadow-lg" : ""
        }`}
      >
        <div className="space-y-3 h-full flex flex-col">
          {/* Paycheck Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-gray-100">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {paycheck.name}
                </h3>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <CalendarDaysIcon className="h-3 w-3" />
                  <span>{format(paycheck.date, "MMM dd")}</span>
                  <span>•</span>
                  <span>{paycheck.frequency}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                ${paycheck.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Drop Zone Indicator */}
          {isDragOver && (
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-blue-400 bg-blue-100 rounded-md">
              <div className="text-center">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">
                  Drop debt here
                </p>
              </div>
            </div>
          )}

          {/* Allocated Debts */}
          {allocation.allocatedDebts.length > 0 && (
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-medium text-gray-700">
                Allocated Payments
              </h4>
              <div className="space-y-1">
                {allocation.allocatedDebts.map((debt) => {
                  // Check if payment is scheduled after due date
                  const isLatePayment =
                    debt.paymentDate &&
                    debt.dueDate &&
                    new Date(debt.paymentDate) > new Date(debt.dueDate);

                  return (
                    <div
                      key={debt.debtId}
                      draggable={movingDebtId !== debt.debtId}
                      onDragStart={(e) => handleDebtDragStart(e, debt.debtId)}
                      onDragEnd={handleDebtDragEnd}
                      className={`relative p-2 rounded-md transition-colors ${
                        movingDebtId === debt.debtId
                          ? "opacity-50 cursor-not-allowed"
                          : isLatePayment
                            ? "bg-red-50 border border-red-200 cursor-move hover:bg-red-100"
                            : "bg-gray-50 cursor-move hover:bg-gray-100"
                      }`}
                    >
                      {/* Loading overlay when moving */}
                      {movingDebtId === debt.debtId && (
                        <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-md flex items-center justify-center z-10">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-blue-700">
                              Moving...
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons - top right */}
                      <div className="absolute top-1 right-1 flex items-center space-x-1">
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit payment"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveDebt(debt.debtId)}
                          disabled={removingDebtId === debt.debtId}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove debt"
                        >
                          {removingDebtId === debt.debtId ? (
                            <div className="w-4 h-4 border border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                          ) : (
                            <XMarkIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Debt Name and Due Date */}
                      <div className="flex items-center space-x-1 mb-1 pr-16">
                        <div
                          data-testid="status-indicator"
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            debt.isPaid
                              ? "bg-green-500"
                              : isLatePayment
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {debt.debtName}
                        </span>

                        {!debt.isPaid && isLatePayment && (
                          <div
                            className="flex items-center space-x-1"
                            title="Payment scheduled after due date"
                          >
                            <ExclamationTriangleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-xs text-red-600 font-medium">
                              Late
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dates and Paid Button */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-xs ${
                              debt.isPaid
                                ? "text-green-600 font-medium"
                                : isLatePayment
                                  ? "text-red-600 font-medium"
                                  : debt.dueDate <
                                      new Date().toISOString().split("T")[0]
                                    ? "text-red-600 font-medium"
                                    : "text-gray-500"
                            }`}
                          >
                            Due {formatDateSafely(debt.dueDate, "MMM dd")}
                            {!debt.isPaid && isLatePayment && " ⚠️"}
                            {!debt.isPaid &&
                              debt.dueDate <
                                new Date().toISOString().split("T")[0] && (
                                <span className="text-red-600 ml-1">
                                  ⚠️ Past Due
                                </span>
                              )}
                          </span>
                          {debt.paymentDate && !debt.isPaid && (
                            <span
                              className={`text-xs ${
                                isLatePayment
                                  ? "text-red-600 font-medium"
                                  : "text-blue-600"
                              }`}
                            >
                              Pay {formatDateSafely(debt.paymentDate, "MMM dd")}
                              {isLatePayment && " (Late)"}
                            </span>
                          )}
                          {debt.isPaid && debt.paymentDate && (
                            <span className="text-xs text-green-600 font-medium">
                              Paid{" "}
                              {formatDateSafely(debt.paymentDate, "MMM dd")}
                              {debt.paymentDate > debt.dueDate && (
                                <span className="text-red-600 ml-1">
                                  (Late)
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Mark as Paid Button - positioned between dates and amount */}
                        {!debt.isPaid &&
                          debt.paymentId &&
                          onMarkPaymentAsPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setMarkingAsPaidId(debt.paymentId!);
                                try {
                                  await onMarkPaymentAsPaid(
                                    debt.debtId,
                                    debt.paymentId!,
                                  );
                                } finally {
                                  setMarkingAsPaidId(null);
                                }
                              }}
                              disabled={markingAsPaidId === debt.paymentId}
                              className="text-xs text-green-700 border-green-300 hover:bg-green-50"
                              title="Mark as paid"
                            >
                              {markingAsPaidId === debt.paymentId ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                "Mark Paid"
                              )}
                            </Button>
                          )}

                        {/* Paid Indicator - show when debt is paid */}
                        {debt.isPaid && (
                          <div className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border-2 border-dashed border-green-300 rounded-md">
                            Paid
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="flex justify-end">
                        <span className="text-sm font-semibold text-gray-900">
                          ${debt.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {allocation.allocatedDebts.length === 0 && !isDragOver && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 w-full">
                <CurrencyDollarIcon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-600">
                  Drop debts here to allocate
                </p>
              </div>
            </div>
          )}

          {/* Remaining Balance */}
          <div className="flex items-center justify-between p-3 rounded-md mt-auto bg-gray-50">
            <div className="flex items-center space-x-2">
              {hasInsufficientFunds ? (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {hasInsufficientFunds
                  ? "Insufficient"
                  : hasRemainingBalance
                    ? "Remaining"
                    : "Allocated"}
              </span>
            </div>
            <span
              className={`text-lg font-bold ${hasInsufficientFunds ? "text-red-600" : hasRemainingBalance ? "text-green-600" : "text-gray-900"}`}
            >
              {hasInsufficientFunds ? "-" : ""}$
              {Math.abs(allocation.remainingAmount).toLocaleString()}
            </span>
          </div>

          {/* Summary */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <div className="flex justify-between items-center">
              <span>
                {allocation.allocatedDebts.length} payment
                {allocation.allocatedDebts.length !== 1 ? "s" : ""}
              </span>
              <span className="font-medium">
                $
                {allocation.allocatedDebts
                  .reduce((sum, debt) => sum + debt.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentCancel}
        onConfirm={handlePaymentConfirm}
        debt={editingDebt?.debt || pendingDebt}
        paycheck={paycheck}
        isEditing={!!editingDebt}
        currentAmount={editingDebt?.currentAmount}
        currentDate={editingDebt?.currentDate}
      />
    </div>
  );
}

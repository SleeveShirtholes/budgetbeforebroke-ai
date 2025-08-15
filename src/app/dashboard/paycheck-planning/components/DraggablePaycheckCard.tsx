import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Sortable from "sortablejs";

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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const hasRemainingBalance = allocation.remainingAmount > 0;

  // Set up SortableJS for the drop zone
  useEffect(() => {
    if (!dropZoneRef.current) return;

    const sortable = Sortable.create(dropZoneRef.current, {
      group: {
        name: "debts",
        put: true,
      },
      animation: 0,
      ghostClass: "",
      chosenClass: "",
      dragClass: "",
      removeCloneOnHide: true,
      fallbackOnBody: false,
      fallbackTolerance: 0,
      delay: 150,
      delayOnTouchOnly: true,
      // Add more safety measures to prevent cloneNode errors
      onChoose: (evt) => {
        // Allow drag operations to proceed, but log any issues for debugging
        if (!evt.item) {
          console.warn("Drag item is null, preventing drag");
          evt.preventDefault();
          return false;
        }

        // Check if the element is in the DOM, but don't prevent drag if it's not
        // This allows for dynamic content that might be created during drag
        if (!document.contains(evt.item)) {
          console.warn("Drag item not in DOM, but allowing drag to proceed");
        }

        // Allow the drag operation to continue
        return true;
      },
      setData: function (dataTransfer, dragEl) {
        if (!dragEl || !dataTransfer) return;
        try {
          if (!document.contains(dragEl)) return;
          const debtId = dragEl.getAttribute("data-debt-id");
          const debtName = dragEl.getAttribute("data-debt-name");
          const debtAmount = dragEl.getAttribute("data-debt-amount");
          const debtDueDate = dragEl.getAttribute("data-debt-due-date");
          if (debtId) {
            dataTransfer.setData(
              "text/plain",
              JSON.stringify({
                debtId,
                debtName: debtName || "",
                debtAmount: debtAmount || "0",
                debtDueDate: debtDueDate || "",
              }),
            );
          }
        } catch (error) {
          console.warn("Error setting drag data:", error);
        }
      },
      onAdd: async (evt) => {
        if (!evt.item) return;
        try {
          if (evt.item && document.contains(evt.item)) {
            evt.item.remove();
          }
        } catch (error) {
          console.warn("Error removing dragged item:", error);
        }

        // Get the debt data from the dragged element's attributes
        const debtId = evt.item.getAttribute("data-debt-id");
        const fromPaycheckId = evt.item.getAttribute("data-from-paycheck");

        if (debtId) {
          if (fromPaycheckId && fromPaycheckId !== paycheck.id) {
            // This is a move from another paycheck - we need more info
            const paymentAmount = evt.item.getAttribute("data-payment-amount");
            const paymentDate = evt.item.getAttribute("data-payment-date");
            const debtName = evt.item.getAttribute("data-debt-name");
            const debtAmount = evt.item.getAttribute("data-debt-amount");
            const debtDueDate = evt.item.getAttribute("data-debt-due-date");

            const debt = {
              id: debtId,
              name: debtName || "",
              amount: parseFloat(debtAmount || "0"),
              dueDate: debtDueDate || "",
              frequency: "",
              description: "",
              isRecurring: false,
            };

            setEditingDebt({
              debt: debt,
              currentAmount: paymentAmount
                ? parseFloat(paymentAmount)
                : parseFloat(debtAmount || "0"),
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
      },
      onStart: (evt) => {
        if (!evt.item) return;
        if (!document.contains(evt.item)) return;
        try {
          const ghosts = document.querySelectorAll(".sortable-ghost");
          ghosts.forEach((ghost) => {
            if (ghost instanceof HTMLElement) {
              ghost.style.display = "none";
              ghost.style.position = "absolute";
              ghost.style.top = "-9999px";
              ghost.style.left = "-9999px";
              ghost.style.opacity = "0";
              ghost.style.pointerEvents = "none";
              ghost.style.zIndex = "-1";
            }
          });
        } catch (error) {
          console.warn("Error hiding ghost elements:", error);
        }
        setIsDragOver(true);
      },
      onEnd: () => {
        setIsDragOver(false);
        try {
          const ghosts = document.querySelectorAll(".sortable-ghost");
          ghosts.forEach((ghost) => {
            if (ghost instanceof HTMLElement) {
              ghost.remove();
            }
          });
        } catch (error) {
          console.warn("Error removing ghost elements:", error);
        }
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [onDebtAllocated, paycheck.id, unallocatedDebts]);

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
    <Card className="transition-all duration-200 min-h-[250px]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Paycheck Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {paycheck.name}
              </h3>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className="font-medium">
                {format(paycheck.date, "MMM dd")}
              </span>
              <span className="text-gray-400">•</span>
              <span className="capitalize">{paycheck.frequency}</span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl font-bold text-gray-900">
                ${paycheck.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone - Only this area should be draggable */}
        <div ref={dropZoneRef} className="flex-1 relative min-h-[120px]">
          {/* Drop Zone Background - Always rendered but hidden when debts exist */}
          <div
            data-testid="drop-zone-background"
            className={`absolute inset-0 transition-all duration-200 rounded-md ${
              isDragOver
                ? "bg-blue-50 border-2 border-dashed border-blue-400"
                : "bg-gray-50 border-2 border-dashed border-gray-300"
            } ${
              allocation.allocatedDebts.length > 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* Drop Zone Content */}
            <div className="h-full flex flex-col">
              {/* Drop Zone Indicator - Only show when dragging over */}
              {isDragOver && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900">
                      Drop debt here
                    </p>
                  </div>
                </div>
              )}

              {/* Empty State - Show when not dragging over */}
              {!isDragOver && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-600">
                      Drop debts here to allocate
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Allocated Debts - Always rendered when debts exist */}
          {allocation.allocatedDebts.length > 0 && (
            <div className="space-y-2 p-2">
              <h4 className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Allocated Payments
              </h4>
              <div className="space-y-2">
                {allocation.allocatedDebts.map((debt) => {
                  // Check if payment is scheduled after due date
                  const isLatePayment =
                    debt.paymentDate &&
                    debt.dueDate &&
                    new Date(debt.paymentDate) > new Date(debt.dueDate);

                  return (
                    <div
                      key={debt.debtId}
                      data-debt-id={debt.debtId}
                      data-from-paycheck={paycheck.id}
                      data-payment-amount={debt.amount}
                      data-payment-date={debt.paymentDate || ""}
                      data-debt-name={debt.debtName}
                      data-debt-amount={debt.amount}
                      data-debt-due-date={debt.dueDate}
                      className={`relative p-3 sm:p-4 rounded-md transition-all duration-200 border ${
                        movingDebtId === debt.debtId
                          ? "opacity-50 cursor-not-allowed border-gray-300"
                          : isLatePayment
                            ? "bg-red-50 border-red-200 cursor-move hover:bg-red-100 hover:border-red-300"
                            : "bg-white border-gray-200 cursor-move hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {/* Loading overlay when moving */}
                      {movingDebtId === debt.debtId && (
                        <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-md flex items-center justify-center z-10">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-blue-700">
                              Moving...
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons - top right */}
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                          title="Edit payment"
                        >
                          <PencilIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveDebt(debt.debtId)}
                          disabled={removingDebtId === debt.debtId}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove debt"
                        >
                          {removingDebtId === debt.debtId ? (
                            <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 border border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                          ) : (
                            <XMarkIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          )}
                        </button>
                      </div>

                      {/* Debt Name and Status */}
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 pr-16">
                        <div
                          data-testid="status-indicator"
                          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${
                            debt.isPaid
                              ? "bg-green-500"
                              : isLatePayment
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {debt.debtName}
                        </span>

                        {!debt.isPaid && isLatePayment && (
                          <div
                            className="flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 border border-red-200 rounded text-xs sm:text-sm text-red-700 font-medium"
                            title="Payment scheduled after due date"
                          >
                            <ExclamationTriangleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 flex-shrink-0" />
                            <span>Late</span>
                          </div>
                        )}
                      </div>

                      {/* Dates and Payment Info */}
                      <div className="space-y-2 sm:space-y-3 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm text-gray-500">
                                Due:
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  debt.isPaid
                                    ? "text-green-600"
                                    : isLatePayment
                                      ? "text-red-600"
                                      : debt.dueDate <
                                          new Date().toISOString().split("T")[0]
                                        ? "text-red-600"
                                        : "text-gray-700"
                                }`}
                              >
                                {formatDateSafely(debt.dueDate, "MMM dd, yyyy")}
                              </span>
                              {!debt.isPaid && isLatePayment && (
                                <span className="text-red-600 text-sm">⚠️</span>
                              )}
                            </div>

                            {debt.paymentDate && !debt.isPaid && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs sm:text-sm text-gray-500">
                                  Pay:
                                </span>
                                <span
                                  className={`text-xs sm:text-sm font-medium ${
                                    isLatePayment
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {formatDateSafely(
                                    debt.paymentDate,
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
                            )}

                            {debt.isPaid && debt.paymentDate && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs sm:text-sm text-gray-500">
                                  Paid:
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-green-600">
                                  {formatDateSafely(
                                    debt.paymentDate,
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
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
                                className="text-xs sm:text-sm font-medium text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400 px-2 sm:px-2.5 py-1 sm:py-1.5"
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
                            <div className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 rounded">
                              Paid
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex justify-end">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          ${debt.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Drop Zone - Show below allocated debts when they exist */}
          {allocation.allocatedDebts.length > 0 && (
            <div className="mt-3 p-3">
              <div
                className={`relative h-20 rounded-md border-2 border-dashed transition-all duration-200 ${
                  isDragOver
                    ? "bg-blue-50 border-blue-400"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="h-full flex flex-col items-center justify-center">
                  {isDragOver ? (
                    <div className="text-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-900">
                        Drop debt here
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CurrencyDollarIcon className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Drop more debts here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Drag Over Overlay - Always on top when dragging */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 transition-all duration-200 z-20 rounded-md">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900">
                      Drop debt here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Remaining Balance */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-1.5 rounded ${
                  hasRemainingBalance
                    ? "bg-green-100 border border-green-200"
                    : "bg-red-100 border border-red-200"
                }`}
              >
                {hasRemainingBalance ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <span
                  className={`text-sm font-semibold ${
                    hasRemainingBalance ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {hasRemainingBalance ? "Remaining" : "Over Budget"}
                </span>
                <div className="text-sm text-gray-500">
                  {allocation.allocatedDebts.length} payment
                  {allocation.allocatedDebts.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-base font-bold ${
                  hasRemainingBalance ? "text-green-700" : "text-red-700"
                }`}
              >
                ${Math.abs(allocation.remainingAmount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                $
                {allocation.allocatedDebts
                  .reduce((sum, debt) => sum + debt.amount, 0)
                  .toLocaleString()}{" "}
                allocated
              </p>
            </div>
          </div>
        </div>
      </div>

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
    </Card>
  );
}

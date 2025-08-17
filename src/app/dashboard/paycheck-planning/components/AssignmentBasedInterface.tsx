import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import CustomSelect from "@/components/Forms/CustomSelect";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import NumberInput from "@/components/Forms/NumberInput";
import { formatDateSafely } from "@/utils/date";
import type {
  PaycheckAllocation,
  PaycheckInfo,
  DebtInfo,
} from "@/app/actions/paycheck-planning";

interface AssignmentBasedInterfaceProps {
  paychecks: PaycheckInfo[];
  allocations: PaycheckAllocation[];
  unallocatedDebts: DebtInfo[];
  onDebtAllocated: (
    debtId: string,
    paycheckId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
  onDebtUnallocated: (debtId: string, paycheckId: string) => Promise<void>;
  onMarkPaymentAsPaid?: (
    debtId: string,
    paymentId: string,
    paymentAmount?: number,
    paymentDate?: string,
  ) => Promise<void>;
}

/**
 * Assignment-based interface for paycheck planning
 * Replaces drag-and-drop with simple assignment controls
 */
export default function AssignmentBasedInterface({
  paychecks,
  allocations,
  unallocatedDebts,
  onDebtAllocated,
  onDebtUnallocated,
  onMarkPaymentAsPaid,
}: AssignmentBasedInterfaceProps) {
  const [editingDebt, setEditingDebt] = useState<{
    debt: DebtInfo;
    paycheckId: string;
    paymentAmount: number;
    paymentDate: string;
  } | null>(null);

  const [selectedDebts, setSelectedDebts] = useState<Set<string>>(new Set());
  const [selectedPaycheckId, setSelectedPaycheckId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingDebts, setDeletingDebts] = useState<Set<string>>(new Set());
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);

  const paycheckOptions = useMemo(() => {
    return paychecks.map((paycheck) => ({
      value: paycheck.id,
      label: `${paycheck.name} - ${formatDateSafely(paycheck.date, "MMM dd")} ($${paycheck.amount.toLocaleString()})`,
    }));
  }, [paychecks]);

  const handleDebtAssignment = async (
    debtId: string,
    paycheckId: string,
    paymentAmount: number,
    paymentDate: string,
  ) => {
    try {
      await onDebtAllocated(debtId, paycheckId, paymentAmount, paymentDate);
      setEditingDebt(null);
    } catch (error) {
      console.error("Failed to assign debt:", error);
    }
  };

  const handleBulkAssignment = async () => {
    // Clear any previous error messages
    setErrorMessage("");

    // Validation
    if (selectedDebts.size === 0) {
      setErrorMessage("Please select at least one debt to assign.");
      return;
    }

    if (!selectedPaycheckId) {
      setErrorMessage("Please select a paycheck to assign debts to.");
      return;
    }

    setIsAssigning(true);
    try {
      const promises = Array.from(selectedDebts).map((debtId: string) => {
        const debt = unallocatedDebts.find((d) => d.id === debtId);
        if (debt) {
          return onDebtAllocated(
            debtId,
            selectedPaycheckId,
            debt.amount,
            format(new Date(), "yyyy-MM-dd"),
          );
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedDebts(new Set());
      setSelectedPaycheckId("");
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to perform bulk assignment:", error);
      setErrorMessage("Failed to assign debts. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDebtRemoval = async (debtId: string) => {
    try {
      // Find which paycheck this debt is allocated to
      const allocation = allocations.find((a) =>
        a.allocatedDebts.some((d) => d.debtId === debtId),
      );

      if (allocation) {
        console.log("Removing debt allocation:", {
          debtId,
          paycheckId: allocation.paycheckId,
        });
        await onDebtUnallocated(debtId, allocation.paycheckId);
        console.log("Debt allocation removed successfully");
      } else {
        console.error("Could not find paycheck allocation for debt:", debtId);
        throw new Error("Could not find paycheck allocation for debt");
      }
    } catch (error) {
      console.error("Failed to remove debt:", error);
      // Re-throw the error so the calling code can handle it
      throw error;
    }
  };

  const getDebtsForPaycheck = (paycheckId: string) => {
    return allocations.filter(
      (allocation) => allocation.paycheckId === paycheckId,
    );
  };

  return (
    <div className="space-y-6">
      {/* Available Debts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available Debts
            </h2>
            <p className="text-sm text-gray-600">
              {unallocatedDebts.length} debt
              {unallocatedDebts.length !== 1 ? "s" : ""} to allocate
            </p>
          </div>
        </div>

        {unallocatedDebts.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-4">
              <CheckCircleIcon className="mx-auto h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Debts Allocated
              </h3>
              <p className="text-base text-gray-600">
                Great job! All debts have been assigned to paychecks.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Debt List with Checkboxes - Mobile: Vertical, Desktop: Horizontal Grid */}
            <div className="lg:hidden bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {unallocatedDebts.map((debt) => {
                const isSelected = selectedDebts.has(debt.id);

                return (
                  <div
                    key={debt.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Single Row Layout - Checkbox and Info */}
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        id={`debt-${debt.id}`}
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedDebts);
                          if (e.target.checked) {
                            newSelected.add(debt.id);
                          } else {
                            newSelected.delete(debt.id);
                          }
                          setSelectedDebts(newSelected);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />

                      {/* Debt Info - Compact */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <label
                            htmlFor={`debt-${debt.id}`}
                            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600"
                          >
                            {debt.name}
                          </label>
                          {/* Only show Past Due badge if it's past due */}
                          {new Date(debt.dueDate) < new Date() && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 border border-red-200 rounded text-xs text-red-700 font-medium">
                              Past Due
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3 w-3" />
                            {formatDateSafely(debt.dueDate, "MMM dd")}
                          </span>
                          <span className="capitalize">{debt.frequency}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${debt.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Layout - Horizontal Grid with Same Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
              {unallocatedDebts.map((debt) => {
                const isSelected = selectedDebts.has(debt.id);

                return (
                  <div
                    key={debt.id}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Same Layout as Mobile - Checkbox and Info */}
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        id={`debt-desktop-${debt.id}`}
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedDebts);
                          if (e.target.checked) {
                            newSelected.add(debt.id);
                          } else {
                            newSelected.delete(debt.id);
                          }
                          setSelectedDebts(newSelected);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />

                      {/* Debt Info - Same Compact Layout */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <label
                            htmlFor={`debt-desktop-${debt.id}`}
                            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600"
                          >
                            {debt.name}
                          </label>
                          {/* Only show Past Due badge if it's past due */}
                          {new Date(debt.dueDate) < new Date() && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 border border-red-200 rounded text-xs text-red-700 font-medium">
                              Past Due
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-3 w-3" />
                            {formatDateSafely(debt.dueDate, "MMM dd")}
                          </span>
                          <span className="capitalize">{debt.frequency}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${debt.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bulk Assignment Controls */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 lg:w-auto lg:max-w-[calc(33.333%-1rem)]">
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      selectedDebts.size === unallocatedDebts.length &&
                      unallocatedDebts.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allDebtIds = new Set(
                          unallocatedDebts.map((debt) => debt.id),
                        );
                        setSelectedDebts(allDebtIds);
                      } else {
                        setSelectedDebts(new Set());
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select All ({selectedDebts.size}/{unallocatedDebts.length})
                  </label>
                </div>

                {/* Paycheck Dropdown */}
                <div className="w-full lg:w-auto">
                  <CustomSelect
                    label="Assign to Paycheck"
                    value={selectedPaycheckId}
                    onChange={(value) => setSelectedPaycheckId(value)}
                    options={[
                      { value: "", label: "Select paycheck..." },
                      ...paycheckOptions,
                    ]}
                  />
                </div>

                {errorMessage && (
                  <div className="text-center text-red-600 text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" />
                    {errorMessage}
                  </div>
                )}

                {/* Assign Button - Responsive sizing */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBulkAssignment}
                  disabled={
                    selectedDebts.size === 0 ||
                    !selectedPaycheckId ||
                    isAssigning
                  }
                  className="w-full lg:w-auto"
                  isLoading={isAssigning}
                >
                  {isAssigning ? "Assigning..." : "Assign Selected"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paycheck Allocations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Paycheck Allocations
        </h2>

        {/* Paycheck Cards - Responsive grid for multiple cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paycheckOptions.map((option) => {
            const paycheck = paychecks.find((p) => p.id === option.value);
            const paycheckAllocations = getDebtsForPaycheck(option.value);
            const totalAllocated = paycheckAllocations.reduce(
              (sum, allocation) =>
                sum +
                allocation.allocatedDebts.reduce(
                  (debtSum, debt) => debtSum + debt.amount,
                  0,
                ),
              0,
            );
            const remaining = (paycheck?.amount || 0) - totalAllocated;

            return (
              <Card
                key={option.value}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Paycheck Header */}
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 flex-shrink-0">
                          <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {paycheck?.name}
                        </h3>
                      </div>
                      <span className="font-bold text-gray-900 text-lg flex-shrink-0">
                        ${paycheck?.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CalendarDaysIcon className="h-3 w-3" />
                      <span>
                        {format(paycheck?.date || new Date(), "MMM dd")}
                      </span>
                    </div>
                  </div>

                  {/* Allocated Debts */}
                  {paycheckAllocations.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                        Allocated Payments (
                        {paycheckAllocations.reduce(
                          (sum, a) => sum + a.allocatedDebts.length,
                          0,
                        )}
                        )
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {paycheckAllocations.flatMap((allocation) =>
                          allocation.allocatedDebts.map((debt) => (
                            <div
                              key={debt.debtId}
                              className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {debt.debtName}
                                  </p>
                                  {debt.paymentDate && (
                                    <p className="text-xs text-gray-600">
                                      {debt.isPaid ? (
                                        <span className="text-green-600 font-medium">
                                          Paid{" "}
                                          {formatDateSafely(
                                            debt.paymentDate,
                                            "MMM dd",
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-blue-600">
                                          Pay{" "}
                                          {formatDateSafely(
                                            debt.paymentDate,
                                            "MMM dd",
                                          )}
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-sm font-bold text-gray-900">
                                    ${debt.amount.toLocaleString()}
                                  </span>
                                  {debt.isPaid ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                      <CheckCircleIcon className="h-3 w-3" />
                                      <span>Paid</span>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setMarkingAsPaid(debt.debtId);
                                        // Initialize with current debt amount and today's date
                                        setPaidAmount(debt.amount.toString());
                                        setPaidDate(
                                          format(new Date(), "yyyy-MM-dd"),
                                        );
                                      }}
                                      className="text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400 text-xs px-2 py-1"
                                      title="Mark as paid"
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  <button
                                    onClick={async () => {
                                      setDeletingDebts((prev) =>
                                        new Set(prev).add(debt.debtId),
                                      );
                                      try {
                                        await handleDebtRemoval(debt.debtId);
                                      } finally {
                                        setDeletingDebts((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete(debt.debtId);
                                          return newSet;
                                        });
                                      }
                                    }}
                                    disabled={deletingDebts.has(debt.debtId)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove debt"
                                  >
                                    {deletingDebts.has(debt.debtId) ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                    ) : (
                                      <XMarkIcon className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No debts allocated</p>
                    </div>
                  )}

                  {/* Remaining Balance */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {remaining >= 0 ? "Remaining Balance" : "Over Budget"}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          remaining >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        ${Math.abs(remaining).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {/* Assignment Modal */}
      {editingDebt && (
        <Modal
          isOpen={!!editingDebt}
          onClose={() => setEditingDebt(null)}
          title="Assign Debt to Paycheck"
          footerButtons={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingDebt(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleDebtAssignment(
                    editingDebt.debt.id,
                    editingDebt.paycheckId,
                    editingDebt.paymentAmount,
                    editingDebt.paymentDate,
                  )
                }
              >
                Assign Debt
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Debt Info */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {editingDebt.debt.name}
              </p>
              <p className="text-xs text-gray-600">
                Amount: ${editingDebt.debt.amount.toLocaleString()}
              </p>
            </div>

            {/* Paycheck Info */}
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {
                  paycheckOptions.find(
                    (o) => o.value === editingDebt.paycheckId,
                  )?.label
                }
              </p>
            </div>

            {/* Payment Amount */}
            <div>
              <NumberInput
                label="Payment Amount"
                value={editingDebt.paymentAmount.toString()}
                onChange={(value) =>
                  setEditingDebt((prev) =>
                    prev
                      ? {
                          ...prev,
                          paymentAmount: parseFloat(value) || 0,
                        }
                      : null,
                  )
                }
                required
              />
            </div>

            {/* Payment Date */}
            <div>
              <CustomDatePicker
                label="Payment Date"
                value={editingDebt.paymentDate}
                onChange={(date) =>
                  setEditingDebt((prev) =>
                    prev
                      ? {
                          ...prev,
                          paymentDate: date || "",
                        }
                      : null,
                  )
                }
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Mark as Paid Modal */}
      {markingAsPaid && (
        <Modal
          isOpen={!!markingAsPaid}
          onClose={() => {
            setMarkingAsPaid(null);
            setPaidAmount("");
            setPaidDate("");
          }}
          title="Mark Debt as Paid"
          footerButtons={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMarkingAsPaid(null);
                  setPaidAmount("");
                  setPaidDate("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isMarkingAsPaid}
                onClick={async () => {
                  try {
                    setIsMarkingAsPaid(true);
                    if (onMarkPaymentAsPaid) {
                      // Find the payment ID for this debt
                      const allocation = allocations.find((a) =>
                        a.allocatedDebts.some(
                          (d) => d.debtId === markingAsPaid,
                        ),
                      );
                      const debt = allocation?.allocatedDebts.find(
                        (d) => d.debtId === markingAsPaid,
                      );

                      if (debt?.paymentId) {
                        // Parse the payment amount and date from the form
                        const amount = parseFloat(paidAmount) || debt.amount;
                        const date =
                          paidDate || format(new Date(), "yyyy-MM-dd");

                        await onMarkPaymentAsPaid(
                          markingAsPaid,
                          debt.paymentId,
                          amount,
                          date,
                        );
                      } else {
                        console.error(
                          "No payment ID found for debt:",
                          markingAsPaid,
                        );
                      }
                    }
                    setMarkingAsPaid(null);
                    setPaidAmount("");
                    setPaidDate("");
                  } catch (error) {
                    console.error("Failed to mark debt as paid:", error);
                  } finally {
                    setIsMarkingAsPaid(false);
                  }
                }}
              >
                {isMarkingAsPaid ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Marking...</span>
                  </div>
                ) : (
                  "Mark as Paid"
                )}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Debt Info */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900">
                {
                  allocations
                    .flatMap((a) => a.allocatedDebts)
                    .find((d) => d.debtId === markingAsPaid)?.debtName
                }
              </p>
              <p className="text-xs text-gray-600">
                Original Amount: $
                {allocations
                  .flatMap((a) => a.allocatedDebts)
                  .find((d) => d.debtId === markingAsPaid)
                  ?.amount.toLocaleString()}
              </p>
            </div>

            {/* Payment Amount */}
            <div>
              <NumberInput
                label="Amount Paid"
                value={
                  paidAmount ||
                  allocations
                    .flatMap((a) => a.allocatedDebts)
                    .find((d) => d.debtId === markingAsPaid)
                    ?.amount.toString() ||
                  ""
                }
                onChange={(value) => setPaidAmount(value)}
                required
              />
            </div>

            {/* Payment Date */}
            <div>
              <CustomDatePicker
                label="Date Paid"
                value={paidDate}
                onChange={(date) => setPaidDate(date || "")}
                required
              />
            </div>

            {/* Confirmation Message */}
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-sm text-green-800">
                Are you sure you want to mark this debt as paid? This action
                cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ExclamationTriangleIcon, CheckCircleIcon, CurrencyDollarIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Spinner from "@/components/Spinner";
import { useBudgetAccount } from "@/stores/budgetAccountStore";
import { usePaycheckPlanning, usePaycheckAllocations } from "@/hooks/usePaycheckPlanning";

import PaycheckCard from "./components/PaycheckCard";
import DebtManagement from "./components/DebtManagement";
import WarningsPanel from "./components/WarningsPanel";
import MonthSelector from "./components/MonthSelector";

/**
 * PaycheckPlanningPage Component
 *
 * A comprehensive page for planning paycheck allocation and debt payments.
 * Features:
 * - Monthly view of all paychecks with dates and amounts
 * - Debt management with due dates and warnings
 * - Automatic allocation suggestions
 * - User-friendly warnings for payment issues
 * - Remaining balance calculations after debt payments
 */
export default function PaycheckPlanningPage() {
  const { selectedAccount, isLoading: isAccountsLoading } = useBudgetAccount();

  // State for month navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  // Fetch paycheck planning data
  const {
    planningData,
    error: planningError,
    isLoading: isPlanningLoading,
    mutatePlanningData,
  } = usePaycheckPlanning(selectedAccount?.id, year, month);

  // Fetch paycheck allocations
  const {
    allocations,
    error: allocationsError,
    isLoading: isAllocationsLoading,
  } = usePaycheckAllocations(selectedAccount?.id, year, month);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1));
  };

  // Loading states
  if (isAccountsLoading || isPlanningLoading || isAllocationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error states
  if (planningError || allocationsError) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">
            {planningError?.message || allocationsError?.message || "Failed to load paycheck planning data"}
          </p>
          <Button 
            variant="primary" 
            onClick={() => {
              mutatePlanningData();
            }}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // No account selected
  if (!selectedAccount) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Budget Account Selected
          </h3>
          <p className="text-gray-600">
            Please select a budget account to view paycheck planning.
          </p>
        </div>
      </Card>
    );
  }

  const { paychecks = [], debts = [], warnings = [] } = planningData || {};
  const totalIncome = paychecks.reduce((sum, paycheck) => sum + paycheck.amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalRemaining = allocations?.reduce((sum, allocation) => sum + Math.max(0, allocation.remainingAmount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paycheck Planning</h1>
          <p className="text-gray-600 mt-1">
            Plan your paycheck allocation and manage debt payments
          </p>
        </div>
        
        <MonthSelector
          selectedDate={selectedDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalIncome.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {paychecks.length} paycheck{paychecks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Debts</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalDebts.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {debts.length} payment{debts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRemaining.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">After debt payments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <WarningsPanel warnings={warnings} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paychecks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Paychecks for {format(selectedDate, 'MMMM yyyy')}
            </h2>
          </div>

          {paychecks.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Paychecks Found
                </h3>
                <p className="text-gray-600 mb-4">
                  No paychecks are scheduled for {format(selectedDate, 'MMMM yyyy')}.
                </p>
                <Button variant="primary" href="/dashboard/income">
                  Add Income Source
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {allocations?.map((allocation) => (
                <PaycheckCard
                  key={allocation.paycheckId}
                  allocation={allocation}
                  paycheck={paychecks.find(p => p.id === allocation.paycheckId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Debt Management Section */}
        <div className="space-y-4">
          <DebtManagement
            debts={debts}
            budgetAccountId={selectedAccount.id}
            onDebtUpdate={() => {
              mutatePlanningData();
            }}
          />
        </div>
      </div>
    </div>
  );
}
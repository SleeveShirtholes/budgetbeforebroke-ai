"use client";

import useMerchantsStore, { Merchant } from "@/stores/merchantsStore";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { ColumnDef } from "@/components/Table/types";
import { mockTransactions } from "@/data/mockTransactions";
import React from "react";
import MerchantDetailPanel from "./components/MerchantDetailPanel";
import MerchantModal from "./components/MerchantModal";
import MerchantTable from "./components/MerchantTable";

/**
 * MerchantsPage Component
 *
 * Main dashboard page for managing merchants tied to user accounts.
 * Features:
 * - Displays a table of merchants with search, sort, and expandable detail panel (transactions per merchant)
 * - Allows adding, editing, and deleting merchants using modals
 * - Handles transaction reassignment or unassignment on merchant deletion
 * - Uses modular, memoized subcomponents for performance and maintainability
 *
 * State:
 * - merchants: List of all merchants
 * - form: Controlled form state for add/edit modals
 * - isAddModalOpen, isEditModalOpen, isDeleteModalOpen: Modal visibility
 * - merchantToEdit, merchantToDelete: Track which merchant is being edited or deleted
 *
 * This page is the main entry point for merchant management in the dashboard.
 */

export default function MerchantsPage() {
  const {
    merchants,
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    merchantToDelete,
    form,
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeAddModal,
    closeEditModal,
    closeDeleteModal,
    setForm,
    addMerchant,
    editMerchant,
    deleteMerchant,
  } = useMerchantsStore();

  const columns: ColumnDef<Merchant>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      filterable: true,
      filterPlaceholder: "Search merchants...",
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      filterable: true,
    },
    {
      key: "transactionCount",
      header: "Transactions",
      sortable: true,
      accessor: (row) => `${row.transactionCount} transactions`,
    },
  ];

  const getRowActions = (row: Merchant) => [
    {
      label: "Edit",
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: () => openEditModal(row),
    },
    {
      label: "Delete",
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => openDeleteModal(row),
    },
  ];

  // Memoize transactions for detail panel
  const getTransactionsForMerchant = React.useCallback(
    (merchantName: string) => {
      return mockTransactions.filter((t) => t.merchant === merchantName);
    },
    [],
  );

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Merchants</h1>
            <p className="text-gray-600 mt-2">
              Manage your merchants. Edit or delete merchants, and view their
              transaction history.
            </p>
          </div>
          <Button variant="primary" onClick={openAddModal} className="ml-4">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Merchant
          </Button>
        </div>
        <MerchantTable
          merchants={merchants}
          columns={columns}
          getRowActions={getRowActions}
          detailPanel={(row) => (
            <MerchantDetailPanel
              transactions={getTransactionsForMerchant(row.name)}
            />
          )}
        />
      </Card>
      <MerchantModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={addMerchant}
        form={form}
        setForm={(value) =>
          setForm(typeof value === "function" ? value(form) : value)
        }
        mode="add"
      />
      <MerchantModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={editMerchant}
        form={form}
        setForm={(value) =>
          setForm(typeof value === "function" ? value(form) : value)
        }
        mode="edit"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Merchant"
        maxWidth="md"
        footerButtons={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button variant="danger" type="button" onClick={deleteMerchant}>
              Delete Merchant
            </Button>
          </>
        }
      >
        {merchantToDelete && (
          <div className="space-y-4">
            <p>
              You are about to delete the merchant{" "}
              <span className="font-semibold">{merchantToDelete.name}</span>.
              This merchant has {merchantToDelete.transactionCount} transactions
              associated with it.
            </p>
            <p>Are you sure you want to delete this merchant?</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

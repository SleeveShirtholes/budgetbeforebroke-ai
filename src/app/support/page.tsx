"use client";

import {
  SupportRequest,
  SupportStatus,
  TableSupportRequest,
  supportStatusOptions,
  SupportCategory,
  Comment,
} from "./types";
import React, { useState } from "react";
import Table, { ColumnDef } from "@/components/Table";

import NewRequestModal from "./components/NewRequestModal";
import SupportDetailPanel from "./components/SupportDetailPanel";
import SupportFilters from "./components/SupportFilters";
import SupportHeader from "./components/SupportHeader";
import SupportTableHeader from "./components/SupportTableHeader";
import useSWR from "swr";
import {
  getPublicSupportRequests,
  getMySupportRequests,
  createSupportRequest,
  upvoteSupportRequest,
  downvoteSupportRequest,
  updateSupportRequestStatus,
} from "@/app/actions/supportRequests";
import { addSupportComment } from "@/app/actions/supportComments";
import { authClient } from "@/lib/auth-client";
import Spinner from "@/components/Spinner";
import { format } from "date-fns";
import { NewRequestFormData } from "./components/NewRequestModal";

/**
 * Support Page Component
 *
 * A comprehensive support ticket management system that allows users to:
 * - View and filter support requests (both personal and public)
 * - Create new support requests
 * - Add comments to existing requests
 * - Vote on support requests
 * - Track request status and updates
 *
 * The component manages several pieces of state:
 * - requests: List of all support requests
 * - isModalOpen: Controls visibility of new request modal
 * - newRequest: Form data for creating new requests
 * - issueView: Toggle between personal and public requests
 * - statusView: Toggle between open and closed requests
 */
export default function Support() {
  // Get the current user's session
  const { data } = authClient.useSession();
  // Extract userId from the session data
  const userId = data?.user?.id;
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueView, setIssueView] = useState<"my" | "public">("my");
  const [statusView, setStatusView] = useState<"open" | "closed">("open");

  // SWR for support requests
  const {
    data: rawRequests = [],
    mutate,
    isLoading,
  } = useSWR(["supportRequests", issueView, statusView, userId], () => {
    // Use the authenticated user's id for personal requests (fallback to empty array if undefined)
    const status = statusView === "open" ? undefined : "Closed";

    if (!userId) {
      return [];
    }

    if (issueView === "my") {
      return getMySupportRequests(userId, status);
    } else {
      return getPublicSupportRequests(status);
    }
  });

  // Type guard for TableSupportRequest
  function isTableSupportRequest(obj: unknown): obj is TableSupportRequest {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      "title" in obj &&
      "description" in obj &&
      "category" in obj &&
      "status" in obj &&
      "lastUpdated" in obj &&
      "isPublic" in obj &&
      "comments" in obj &&
      "upvotes" in obj &&
      "downvotes" in obj &&
      "user" in obj
    );
  }

  // Map backend results to TableSupportRequest[]
  const requests: TableSupportRequest[] = rawRequests.map((req: unknown) => {
    if (isTableSupportRequest(req)) {
      return req;
    }
    // Fallback: fill missing fields with defaults
    return {
      id: ((req as Record<string, unknown>).id as string) || "",
      title: ((req as Record<string, unknown>).title as string) || "",
      description:
        ((req as Record<string, unknown>).description as string) || "",
      category:
        ((req as Record<string, unknown>).category as SupportCategory) ||
        "General Question",
      status:
        ((req as Record<string, unknown>).status as SupportStatus) || "Open",
      lastUpdated:
        ((req as Record<string, unknown>).lastUpdated as string) ||
        new Date().toISOString(),
      isPublic: ((req as Record<string, unknown>).isPublic as boolean) || false,
      comments: ((req as Record<string, unknown>).comments as Comment[]) || [],
      upvotes: ((req as Record<string, unknown>).upvotes as number) || 0,
      downvotes: ((req as Record<string, unknown>).downvotes as number) || 0,
      user: ((req as Record<string, unknown>).user as string) || "",
    } as TableSupportRequest;
  });

  // Table title
  const tableTitle =
    statusView === "closed"
      ? issueView === "my"
        ? "My Closed Issues"
        : "Closed Public Issues"
      : issueView === "my"
        ? "My Open Issues"
        : "All Public Issues";

  // Table columns (ID removed from main table)
  const columns: ColumnDef<SupportRequest>[] = [
    // Removed ID column from main table
    {
      key: "title",
      header: "Title",
      sortable: true,
      filterable: true,
      accessor: (row) => (
        <span className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
          {row.title}
        </span>
      ),
    },
    { key: "category", header: "Category", sortable: true, filterable: true },
    { key: "upvotes", header: "Upvotes", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      accessor: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "Open"
              ? "bg-green-100 text-green-800"
              : row.status === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      sortable: true,
      // Format date using date-fns to 'MMM d, yyyy h:mm a' (e.g., 'Jul 22, 2025 4:59 pm')
      accessor: (row) =>
        format(new Date(row.lastUpdated), "MMM d, yyyy h:mm a"),
    },
  ];

  // Create a new support request (now expects form data, not event)
  const handleCreateRequest = async (data: NewRequestFormData) => {
    if (!data.title.trim() || !data.description.trim()) return;
    if (!userId) return; // Ensure user is authenticated
    await createSupportRequest({
      title: data.title,
      description: data.description,
      category: data.category,
      isPublic: data.isPublic,
      userId: userId,
    });
    setIsModalOpen(false);
    // Await mutate to ensure UI updates after mutation
    await mutate();
  };

  // Add a comment to a support request
  const handleAddComment = async (requestId: string, comment: string) => {
    if (!comment.trim()) return;
    if (!userId) return; // Ensure user is authenticated
    await addSupportComment({
      requestId,
      text: comment.trim(),
      userId: userId,
    });
    // Await mutate to ensure UI updates after mutation
    await mutate();
  };

  // Upvote a support request
  const handleUpvote = async (requestId: string) => {
    await upvoteSupportRequest(requestId);
    // Await mutate to ensure UI updates after mutation
    await mutate();
  };

  // Downvote a support request
  const handleDownvote = async (requestId: string) => {
    await downvoteSupportRequest(requestId);
    // Await mutate to ensure UI updates after mutation
    await mutate();
  };

  // Change status of a support request
  const handleStatusChange = async (
    requestId: string,
    newStatus: SupportStatus,
  ) => {
    await updateSupportRequestStatus(requestId, newStatus);
    // Await mutate to ensure UI updates after mutation
    await mutate();
  };

  /**
   * Show a loading spinner until both session and data are available.
   * This ensures the UI does not render until authentication and data fetching are complete.
   */
  if (!data || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2">
      <SupportHeader />
      <SupportFilters
        issueView={issueView}
        onIssueViewChange={setIssueView}
        onCreateRequest={() => setIsModalOpen(true)}
      />
      <section className="mb-12">
        <SupportTableHeader
          tableTitle={tableTitle}
          statusView={statusView}
          onStatusViewChange={setStatusView}
        />
        <Table<TableSupportRequest>
          data={requests as TableSupportRequest[]}
          columns={columns as ColumnDef<TableSupportRequest>[]}
          pageSize={5}
          detailPanel={(row) => (
            <SupportDetailPanel
              request={row}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
              supportStatusOptions={supportStatusOptions}
              // Show the ID in the details panel
              showId={true}
            />
          )}
        />
      </section>
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}

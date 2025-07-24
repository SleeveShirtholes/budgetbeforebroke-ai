"use client";

import {
  SupportRequest,
  SupportStatus,
  TableSupportRequest,
  supportStatusOptions,
  SupportCategory, // re-add for type assertion
  // Comment, // removed unused
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
import {
  addSupportComment,
  getSupportCommentsForRequests,
} from "@/app/actions/supportComments";
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
 * - showPagination: Controls visibility of table pagination (external to Table)
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
  // Pagination state for Table
  const [showPagination, setShowPagination] = useState(true);

  // SWR for support requests
  const {
    data: rawRequests = [],
    mutate,
    isLoading,
  } = useSWR(["supportRequests", issueView, statusView, userId], async () => {
    // Fix: Only filter for 'Closed' status, otherwise fetch all non-closed for 'open'
    const status = statusView === "closed" ? "Closed" : undefined;

    // Fix: Allow unauthenticated users to view public requests
    if (issueView === "my") {
      if (!userId) return [];
      return getMySupportRequests(userId, status);
    } else {
      return getPublicSupportRequests(status);
    }
  });

  // SWR for comments for all requests
  const { data: allComments = [] } = useSWR(
    [
      "supportComments",
      rawRequests.map((r: unknown) => (r as { id: string }).id),
    ],
    () =>
      getSupportCommentsForRequests(
        rawRequests.map((r: unknown) => (r as { id: string }).id),
      ),
    { keepPreviousData: true },
  );

  // Improved type guard for TableSupportRequest
  function isTableSupportRequest(obj: unknown): obj is TableSupportRequest {
    if (typeof obj !== "object" || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
      typeof o.id === "string" &&
      typeof o.title === "string" &&
      typeof o.description === "string" &&
      typeof o.category === "string" &&
      typeof o.status === "string" &&
      typeof o.lastUpdated === "string" &&
      typeof o.isPublic === "boolean" &&
      Array.isArray(o.comments) &&
      typeof o.upvotes === "number" &&
      typeof o.downvotes === "number" &&
      typeof o.user === "string"
    );
  }

  // Map backend results to TableSupportRequest[], merging in comments
  const requests = (rawRequests as unknown[]).map((req: unknown) => {
    // Find comments for this request
    const comments = (allComments as unknown[])
      .filter(
        (c: unknown) =>
          (c as { requestId: string }).requestId === (req as { id: string }).id,
      )
      .map((c: unknown) => ({
        id: (c as { id: string }).id,
        user:
          (c as { userName?: string; userId?: string }).userName ||
          (c as { userId?: string }).userId ||
          "Unknown",
        text: (c as { text: string }).text,
        timestamp:
          (c as { timestamp: string | Date }).timestamp instanceof Date
            ? (c as { timestamp: Date }).timestamp.toISOString()
            : (c as { timestamp: string }).timestamp,
      }));
    // Use improved type guard
    if (isTableSupportRequest({ ...(req as object), comments })) {
      return { ...(req as object), comments } as TableSupportRequest;
    }
    // Fallback: fill missing fields with defaults
    return {
      id: (req as { id?: string }).id || "",
      title: (req as { title?: string }).title || "",
      description: (req as { description?: string }).description || "",
      category:
        ((req as { category?: string }).category as SupportCategory) ||
        "General Question",
      status: ((req as { status?: string }).status as SupportStatus) || "Open",
      lastUpdated:
        (req as { lastUpdated?: string }).lastUpdated ||
        new Date().toISOString(),
      isPublic: (req as { isPublic?: boolean }).isPublic || false,
      comments,
      upvotes: (req as { upvotes?: number }).upvotes || 0,
      downvotes: (req as { downvotes?: number }).downvotes || 0,
      user: (req as { user?: string }).user || "",
    } satisfies TableSupportRequest;
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
          data={requests}
          columns={columns as ColumnDef<TableSupportRequest>[]}
          pageSize={5}
          showPagination={showPagination}
          onPaginationChange={setShowPagination}
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

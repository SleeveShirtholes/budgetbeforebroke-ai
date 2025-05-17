"use client";

import {
  Comment,
  SupportCategory,
  SupportRequest,
  SupportStatus,
  TableSupportRequest,
  currentUser,
  supportStatusOptions,
} from "./types";
import React, { useState } from "react";
import Table, { ColumnDef } from "@/components/Table";

import NewRequestModal from "./components/NewRequestModal";
import SupportDetailPanel from "./components/SupportDetailPanel";
import SupportFilters from "./components/SupportFilters";
import SupportHeader from "./components/SupportHeader";
import SupportTableHeader from "./components/SupportTableHeader";

// Mock data for initial display
const mockSupportRequests: SupportRequest[] = [
  {
    id: "SR001",
    title: "Login Issue",
    description:
      "User is unable to login with their valid credentials. This started happening after the last update. Error message says 'Invalid username or password' but credentials are correct.",
    category: "Issue",
    status: "Open",
    lastUpdated: "2024-07-28",
    isPublic: false,
    comments: [
      {
        id: "C1",
        user: "Admin",
        text: "Looking into this.",
        timestamp: "2024-07-28T10:00:00Z",
      },
    ],
    upvotes: 10,
    downvotes: 1,
    user: "John Doe",
  },
  {
    id: "SR002",
    title: "Feature Request: Dark Mode",
    description:
      "It would be great to have a dark mode option for the application to reduce eye strain, especially during night time use.",
    category: "Feature Request",
    status: "In Progress",
    lastUpdated: "2024-07-27",
    isPublic: true,
    comments: [],
    upvotes: 25,
    downvotes: 0,
    user: "Jane Smith",
  },
  {
    id: "SR003",
    title: "Payment Failed",
    description:
      "User reported a payment failure with error code X. Attempted multiple times with different cards. Needs urgent attention.",
    category: "Issue",
    status: "Closed",
    lastUpdated: "2024-07-26",
    isPublic: false,
    comments: [
      {
        id: "C2",
        user: "SupportTeam",
        text: "Issue resolved. Was a temporary gateway problem.",
        timestamp: "2024-07-26T14:00:00Z",
      },
    ],
    upvotes: 5,
    downvotes: 2,
    user: "John Doe",
  },
];

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
 * - commentText: Current comment being written
 * - issueView: Toggle between personal and public requests
 * - statusView: Toggle between open and closed requests
 */
export default function Support() {
  // State management for support requests and UI controls
  const [requests, setRequests] =
    useState<SupportRequest[]>(mockSupportRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState<
    Omit<SupportRequest, "id" | "lastUpdated">
  >({
    title: "",
    description: "",
    category: "Issue",
    status: "Open",
    isPublic: false,
    comments: [],
    upvotes: 0,
    downvotes: 0,
    user: currentUser,
  });
  const [commentText, setCommentText] = useState("");
  const [issueView, setIssueView] = useState<"my" | "public">("my");
  const [statusView, setStatusView] = useState<"open" | "closed">("open");

  // Filter requests based on current view settings (my/public and open/closed)
  const filteredRequests = requests.filter((req) => {
    const isClosed = req.status === "Closed";
    if (statusView === "open" && isClosed) return false;
    if (statusView === "closed" && !isClosed) return false;
    if (issueView === "my") {
      return req.user === currentUser;
    } else {
      return req.isPublic;
    }
  });

  // Generate table title based on current view settings
  const tableTitle =
    statusView === "closed"
      ? issueView === "my"
        ? "My Closed Issues"
        : "Closed Public Issues"
      : issueView === "my"
        ? "My Open Issues"
        : "All Public Issues";

  // Table column definitions with custom rendering for specific fields
  const columns: ColumnDef<SupportRequest>[] = [
    { key: "id", header: "ID", sortable: true, filterable: true },
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
    { key: "lastUpdated", header: "Last Updated", sortable: true },
  ];

  // Event handlers for managing support requests
  const handleNewRequestChange = (
    field: keyof Omit<
      SupportRequest,
      "id" | "lastUpdated" | "comments" | "upvotes" | "downvotes" | "user"
    >,
    value: string | SupportCategory | boolean | SupportStatus,
  ) => {
    setNewRequest((prev) => ({ ...prev, [field]: value }));
  };

  // Create a new support request with validation
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: do not add if title or description is empty
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      return;
    }
    const newSupportRequest: SupportRequest = {
      ...newRequest,
      id: `SR${String(requests.length + 1).padStart(3, "0")}`,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newSupportRequest, ...prev]);
    setIsModalOpen(false);
    setNewRequest({
      title: "",
      description: "",
      category: "Issue",
      status: "Open",
      isPublic: false,
      comments: [],
      upvotes: 0,
      downvotes: 0,
      user: currentUser,
    });
  };

  // Add a comment to an existing support request
  const handleAddComment = (requestId: string) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `C${Date.now()}`,
      user: "CurrentUser",
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };

    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              comments: [...req.comments, newComment],
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : req,
      ),
    );
    setCommentText("");
  };

  // Handle upvoting a support request
  const handleUpvote = (requestId: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, upvotes: req.upvotes + 1 } : req,
      ),
    );
  };

  // Handle downvoting a support request
  const handleDownvote = (requestId: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, downvotes: req.downvotes + 1 } : req,
      ),
    );
  };

  // Update the status of a support request
  const handleStatusChange = (requestId: string, newStatus: SupportStatus) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: newStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : req,
      ),
    );
  };

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
          data={filteredRequests as TableSupportRequest[]}
          columns={columns as ColumnDef<TableSupportRequest>[]}
          pageSize={5}
          detailPanel={(row) => (
            <SupportDetailPanel
              request={row}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
              commentText={commentText}
              setCommentText={setCommentText}
              supportStatusOptions={supportStatusOptions}
            />
          )}
        />
      </section>
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
        newRequest={newRequest}
        onNewRequestChange={handleNewRequestChange}
      />
    </div>
  );
}

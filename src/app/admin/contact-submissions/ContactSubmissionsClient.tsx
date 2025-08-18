"use client";

import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import {
  updateContactSubmissionStatus,
  sendFollowUpEmailToUser,
  getConversationHistory,
} from "@/app/actions/contact";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: "new" | "in_progress" | "resolved" | "closed";
  notes: string | null;
  conversationId: string | null;
  lastUserMessageAt: Date | null;
  lastSupportMessageAt: Date | null;
  assignedTo: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactSubmissionsClientProps {
  initialSubmissions: ContactSubmission[];
}

export default function ContactSubmissionsClient({
  initialSubmissions,
}: ContactSubmissionsClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set(),
  );
  const [followUpData, setFollowUpData] = useState<{
    submissionId: string;
    message: string;
    supportName: string;
    supportEmail: string;
  } | null>(null);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  const toggleExpanded = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const handleStatusUpdate = async (
    submissionId: string,
    status: string,
    notes: string,
  ) => {
    try {
      const result = await updateContactSubmissionStatus(
        submissionId,
        status as "new" | "in_progress" | "resolved" | "closed",
        notes,
      );

      if (result.success && result.submission) {
        // Update the local state with proper type conversion
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  status: result.submission.status as
                    | "new"
                    | "in_progress"
                    | "resolved"
                    | "closed",
                  notes: result.submission.notes,
                  updatedAt: result.submission.updatedAt,
                  resolvedAt: result.submission.resolvedAt,
                }
              : sub,
          ),
        );
        console.log("Status updated successfully");
      } else {
        console.error("Failed to update status:", result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUpData) return;

    setIsSendingFollowUp(true);
    try {
      const result = await sendFollowUpEmailToUser(
        followUpData.submissionId,
        followUpData.message,
        followUpData.supportName,
        followUpData.supportEmail,
      );

      if (result.success && result.submission) {
        // Update the local state with proper type conversion
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === followUpData.submissionId
              ? {
                  ...sub,
                  notes: result.submission.notes,
                  updatedAt: result.submission.updatedAt,
                  lastSupportMessageAt: result.submission.lastSupportMessageAt,
                }
              : sub,
          ),
        );
        setFollowUpData(null);
        console.log("Follow-up email sent successfully");
      } else {
        console.error("Failed to send follow-up email:", result.error);
      }
    } catch (error) {
      console.error("Error sending follow-up email:", error);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const isExpanded = (submissionId: string) =>
    expandedSubmissions.has(submissionId);
  const isClosed = (status: string) => status === "closed";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Contact Submissions</h1>

      {submissions.length === 0 ? (
        <Card>
          <p className="text-gray-600">No contact submissions found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <ContactSubmissionCard
              key={submission.id}
              submission={submission}
              onStatusUpdate={handleStatusUpdate}
              onSendFollowUp={(submissionId) =>
                setFollowUpData({
                  submissionId,
                  message: "",
                  supportName: "",
                  supportEmail: "",
                })
              }
              isExpanded={isExpanded(submission.id)}
              onToggleExpanded={() => toggleExpanded(submission.id)}
              isClosed={isClosed(submission.status)}
            />
          ))}
        </div>
      )}

      {/* Follow-up Email Modal */}
      {followUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Follow-up Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={followUpData.supportName}
                  onChange={(e) =>
                    setFollowUpData((prev) =>
                      prev ? { ...prev, supportName: e.target.value } : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Support Staff Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={followUpData.supportEmail}
                  onChange={(e) =>
                    setFollowUpData((prev) =>
                      prev ? { ...prev, supportEmail: e.target.value } : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={followUpData.message}
                  onChange={(e) =>
                    setFollowUpData((prev) =>
                      prev ? { ...prev, message: e.target.value } : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Type your response to the user..."
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleSendFollowUp}
                  disabled={
                    !followUpData.message ||
                    !followUpData.supportName ||
                    !followUpData.supportEmail ||
                    isSendingFollowUp
                  }
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isSendingFollowUp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Email"
                  )}
                </Button>
                <Button
                  onClick={() => setFollowUpData(null)}
                  variant="secondary"
                  disabled={isSendingFollowUp}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactSubmissionCard({
  submission,
  onStatusUpdate,
  onSendFollowUp,
  isExpanded,
  onToggleExpanded,
  isClosed,
}: {
  submission: ContactSubmission;
  onStatusUpdate: (id: string, status: string, notes: string) => Promise<void>;
  onSendFollowUp: (submissionId: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isClosed: boolean;
}) {
  const [status, setStatus] = useState(submission.status);
  const [notes, setNotes] = useState(submission.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [conversations, setConversations] = useState<
    Array<{
      id: string;
      conversationId: string;
      messageId: string | null;
      fromEmail: string;
      fromName: string;
      toEmail: string;
      subject: string;
      message: string;
      messageType: string;
      direction: string;
      rawEmail: string | null;
      createdAt: Date;
    }>
  >([]);
  const [showConversations, setShowConversations] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(submission.id, status, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  const loadConversations = async () => {
    if (conversations.length > 0) {
      setShowConversations(!showConversations);
      return;
    }

    setLoadingConversations(true);
    try {
      const result = await getConversationHistory(submission.id);
      if (result.success && result.conversations) {
        setConversations(result.conversations);
        setShowConversations(true);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // For closed submissions, show minimal info unless expanded
  if (isClosed && !isExpanded) {
    return (
      <div
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onToggleExpanded}
      >
        <Card>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{submission.subject}</h3>
              <p className="text-sm text-gray-600">
                From: {submission.name} ({submission.email})
              </p>
              <p className="text-sm text-gray-600">
                Submitted: {formatDate(submission.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
              >
                {status}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{submission.subject}</h3>
            <p className="text-sm text-gray-600">
              From: {submission.name} ({submission.email})
            </p>
            <p className="text-sm text-gray-600">
              Submitted: {formatDate(submission.createdAt)}
            </p>
            {submission.resolvedAt && (
              <p className="text-sm text-gray-600">
                Resolved: {formatDate(submission.resolvedAt)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {status}
            </span>
            {isClosed && (
              <button
                onClick={onToggleExpanded}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Message:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">
            {submission.message}
          </p>
        </div>

        {submission.ipAddress && (
          <div className="text-sm text-gray-600">
            <strong>IP Address:</strong> {submission.ipAddress}
          </div>
        )}

        {submission.userAgent && (
          <div className="text-sm text-gray-600">
            <strong>User Agent:</strong> {submission.userAgent}
          </div>
        )}

        {submission.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes:</h4>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {submission.notes}
            </p>
          </div>
        )}

        {/* Conversation History */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Conversation History</h4>
            <Button
              onClick={loadConversations}
              variant="secondary"
              size="sm"
              disabled={loadingConversations}
              className="flex items-center gap-2"
            >
              {loadingConversations ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>{showConversations ? "Hide" : "Show"} Conversations</>
              )}
            </Button>
          </div>

          {showConversations && conversations.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg border ${
                    conv.direction === "inbound"
                      ? "bg-blue-50 border-blue-200 ml-4"
                      : "bg-green-50 border-green-200 mr-4"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {conv.direction === "inbound" ? "User" : "Support"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {conv.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {showConversations && conversations.length === 0 && (
            <p className="text-gray-500 text-sm">
              No conversation history found.
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <CustomSelect
                value={status}
                onChange={(value) =>
                  setStatus(
                    value as "new" | "in_progress" | "resolved" | "closed",
                  )
                }
                options={[
                  { value: "new", label: "New" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                ]}
                label="Status"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Add internal notes..."
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>

            {status !== "closed" && (
              <Button
                onClick={() => onSendFollowUp(submission.id)}
                variant="secondary"
                className="flex-1"
              >
                Send Follow-up Email
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

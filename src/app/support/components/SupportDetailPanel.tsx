import CustomSelect, { SelectOption } from "@/components/Forms/CustomSelect";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { SupportRequest, SupportStatus } from "../types";

import Button from "@/components/Button";
import React from "react";
import TextArea from "@/components/Forms/TextArea";

/**
 * SupportDetailPanel
 *
 * Displays the details, voting, metadata, description, comments, and add comment form for a support request.
 */
interface SupportDetailPanelProps {
  request: SupportRequest;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onStatusChange: (id: string, newStatus: SupportStatus) => void;
  onAddComment: (id: string) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  supportStatusOptions: SelectOption[];
}

const SupportDetailPanel: React.FC<SupportDetailPanelProps> = ({
  request: row,
  onUpvote,
  onDownvote,
  onStatusChange,
  onAddComment,
  commentText,
  setCommentText,
  supportStatusOptions,
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 my-2">
    {/* Header: Title and Voting */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
      <h3 className="text-xl font-semibold text-gray-900">Ticket Details</h3>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="text"
            size="sm"
            onClick={() => onUpvote(row.id)}
            aria-label="Upvote"
            className="p-1"
          >
            <HandThumbUpIcon className="h-5 w-5 text-green-500 hover:text-green-600" />
          </Button>
          <span className="text-sm font-medium text-gray-700">
            {row.upvotes}
          </span>
          <Button
            variant="text"
            size="sm"
            onClick={() => onDownvote(row.id)}
            aria-label="Downvote"
            className="p-1"
          >
            <HandThumbDownIcon className="h-5 w-5 text-red-500 hover:text-red-600" />
          </Button>
          <span className="text-sm font-medium text-gray-700">
            {row.downvotes}
          </span>
        </div>
      </div>
    </div>
    {/* Metadata Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
      <div>
        <span className="text-gray-500">ID:</span>{" "}
        <span className="font-mono text-gray-800">{row.id}</span>
      </div>
      <div>
        <span className="text-gray-500">Category:</span>{" "}
        <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
          {row.category}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Status:</span>
        <CustomSelect
          id={`status-select-${row.id}`}
          options={supportStatusOptions}
          value={row.status}
          onChange={(newStatusValue) =>
            onStatusChange(row.id, newStatusValue as SupportStatus)
          }
          fullWidth={false}
        />
      </div>
      <div>
        <span className="text-gray-500">Visibility:</span>{" "}
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${row.isPublic ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}
        >
          {row.isPublic ? "Public" : "Private"}
        </span>
      </div>
      <div>
        <span className="text-gray-500">Last Updated:</span>{" "}
        <span className="text-gray-800">
          {new Date(row.lastUpdated).toLocaleDateString()}
        </span>
      </div>
    </div>
    {/* Divider */}
    <hr className="my-4" />
    {/* Description */}
    <div className="mb-6">
      <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
      <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded p-4 border border-gray-100">
        {row.description}
      </p>
    </div>
    {/* Comments Section */}
    <div className="mt-8">
      <h4 className="text-md font-semibold text-gray-700 mb-3">
        Comments <span className="text-gray-400">({row.comments.length})</span>
      </h4>
      <div className="space-y-4 mb-6">
        {row.comments.length > 0 ? (
          row.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 border border-gray-200 rounded-md p-3"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xs text-primary-700">
                  {comment.user}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>
      {/* Add Comment Form */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">
          Add a comment
        </h5>
        <TextArea
          id={`comment-input-${row.id}`}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Type your comment..."
          rows={3}
          label="Your Comment"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAddComment(row.id)}
          className="mt-2"
        >
          Submit Comment
        </Button>
      </div>
    </div>
  </div>
);

export default SupportDetailPanel;

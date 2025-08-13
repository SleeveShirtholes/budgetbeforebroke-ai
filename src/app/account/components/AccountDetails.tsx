import {
  PaperAirplaneIcon,
  PencilIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Account } from "@/stores/accountStore";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomSelect from "@/components/Forms/CustomSelect";
import RowActions from "@/components/Table/RowActions";

interface AccountDetailsProps {
  account: Account;
  onEditNickname: () => void;
  onInviteUser: () => void;
  onRemoveUser: (userId: string) => void;
  onDeleteInvitation: (invitationId: string) => void;
  onUpdateUserRole: (userId: string, role: "owner" | "member") => void;
  onResendInvite: (userId: string) => void;
  isOwner: boolean;
  isDefault?: boolean;
  isLoadingDefault?: boolean;
  onSetDefault?: () => void;
}

const roleOptions = [
  { value: "member", label: "Member" },
  { value: "owner", label: "Owner" },
];

/**
 * AccountDetails Component
 *
 * Displays detailed information about a selected account, including:
 * - Account nickname and number
 * - List of accepted members with their roles and management options
 * - List of pending invites with resend/delete options
 * - Ability to invite new users
 *
 * @param {Account} account - The account object containing all account details
 * @param {() => void} onEditNickname - Callback function to open the edit nickname modal
 * @param {() => void} onInviteUser - Callback function to open the invite user modal
 * @param {(userId: string) => void} onRemoveUser - Callback function to remove a user from the account
 * @param {(invitationId: string) => void} onDeleteInvitation - Callback function to delete an invitation
 * @param {(userId: string, role: "owner" | "member") => void} onUpdateUserRole - Callback function to update a user's role
 * @param {(userId: string) => void} onResendInvite - Callback function to resend an invitation
 * @param {boolean} isOwner - Indicates whether the current user is the owner of the account
 * @param {boolean} isDefault - Indicates whether the account is the default account
 * @param {boolean} isLoadingDefault - Indicates whether the default account status is being loaded
 * @param {() => void} onSetDefault - Callback function to set the account as default
 */
export default function AccountDetails({
  account,
  onEditNickname,
  onInviteUser,
  onRemoveUser,
  onDeleteInvitation,
  onUpdateUserRole,
  onResendInvite,
  isOwner,
  isDefault = false,
  isLoadingDefault = false,
  onSetDefault,
}: AccountDetailsProps) {
  // Deduplicate accepted users by id
  const acceptedUsers = Array.from(
    new Map(account.users.map((u) => [u.id, u])).values(),
  );
  const pendingInvites =
    account.invitations?.filter((inv) => inv.status === "pending") || [];

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-semibold">{account.nickname}</h2>
              <div className="flex flex-wrap gap-2">
                {isDefault && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                    Default Account
                  </span>
                )}
                {!isDefault && onSetDefault && (
                  <button
                    className="px-3 py-1 text-xs font-semibold bg-gray-200 hover:bg-primary-200 text-gray-700 rounded-full transition"
                    onClick={onSetDefault}
                    disabled={isLoadingDefault}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-500 mt-2 sm:mt-0">
              <span className="font-bold">Account #: </span>
              {account.accountNumber}
            </p>
          </div>
          {isOwner && (
            <Button
              variant="primary"
              onClick={onEditNickname}
              fullWidth
              className="sm:w-auto"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Nickname
            </Button>
          )}
        </div>

        {/* Account Members */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Account Members</h3>
          <div className="space-y-4">
            {acceptedUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size={40}
                    className="w-10 h-10"
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  {isOwner ? (
                    <div className="w-full sm:w-32">
                      <CustomSelect
                        value={user.role}
                        onChange={(value) =>
                          onUpdateUserRole(user.id, value as "owner" | "member")
                        }
                        options={roleOptions}
                        fullWidth
                      />
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                                                ${
                                                  user.role === "owner"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-gray-100 text-gray-700"
                                                }
                                            `}
                      style={{ minWidth: 56, justifyContent: "center" }}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => onRemoveUser(user.id)}
                      className="flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 p-1.5 h-8 w-8 flex-shrink-0 self-center"
                      aria-label={`Remove ${user.name}`}
                      type="button"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invites Section */}
          {pendingInvites.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Pending Invites</h3>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-yellow-50 rounded-lg gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar
                        name={invite.inviteeEmail.split("@")[0]}
                        size={40}
                        className="w-10 h-10"
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {invite.inviteeEmail.split("@")[0]}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {invite.inviteeEmail}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                      {isOwner && (
                        <RowActions
                          actions={[
                            {
                              label: "Resend",
                              icon: <PaperAirplaneIcon className="w-4 h-4" />,
                              onClick: () => onResendInvite(invite.id),
                            },
                            {
                              label: "Delete",
                              icon: <XMarkIcon className="w-4 h-4" />,
                              onClick: () => onDeleteInvitation(invite.id),
                            },
                          ]}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOwner && (
            <Button
              variant="primary"
              onClick={onInviteUser}
              className="mt-4"
              fullWidth
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

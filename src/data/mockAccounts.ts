import { Account } from "@/stores/accountStore";

export const mockAccounts: Account[] = [
  {
    id: "1",
    accountNumber: "ACC-001",
    nickname: "Personal Account",
    users: [
      {
        id: "u1",
        email: "john@example.com",
        name: "John Doe",
        role: "owner",
        avatar: "/default-avatar.png",
        accepted: false,
      },
      {
        id: "u2",
        email: "jane@example.com",
        name: "Jane Smith",
        role: "member",
        avatar: "/default-avatar.png",
        accepted: true,
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    accountNumber: "ACC-002",
    nickname: "Family Account",
    users: [
      {
        id: "u1",
        email: "john@example.com",
        name: "John Doe",
        role: "member",
        avatar: "/default-avatar.png",
        accepted: true,
      },
      {
        id: "u3",
        email: "sarah@example.com",
        name: "Sarah Johnson",
        role: "owner",
        avatar: "/default-avatar.png",
        accepted: true,
      },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

import { PlaidLinkOnSuccessMetadata, usePlaidLink } from "react-plaid-link";

import { useState } from "react";
import Button from "./Button";

interface PlaidLinkProps {
  budgetAccountId: string;
  onSuccess?: () => void;
}

export function PlaidLink({
  budgetAccountId,
  onSuccess: onSuccessCallback,
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const handleSuccess = async (
    public_token: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) => {
    try {
      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicToken: public_token,
          metadata: {
            ...metadata,
            budgetAccountId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange token");
      }

      onSuccessCallback?.();
    } catch (error) {
      console.error("Error exchanging token:", error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
  });

  const handleClick = async () => {
    try {
      const response = await fetch("/api/plaid/link-token", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create link token");
      }

      const data = await response.json();
      setLinkToken(data.link_token);
      open();
    } catch (error) {
      console.error("Error creating link token:", error);
    }
  };

  return (
    <Button onClick={handleClick} disabled={!ready}>
      Connect Bank Account
    </Button>
  );
}

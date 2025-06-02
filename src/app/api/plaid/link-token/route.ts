import { CountryCode, Products } from "plaid";

import { auth } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const plaidRequest = {
      user: {
        client_user_id: sessionResult.user.id,
      },
      client_name: "Budget Before Broke",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    };

    const response = await plaidClient.linkTokenCreate(plaidRequest);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error creating link token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { plaidClient } from "@/lib/plaid";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { CountryCode } from "plaid";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { publicToken, metadata } = await req.json();
    if (!publicToken || !metadata) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution details
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: metadata.institution.institution_id,
      country_codes: [CountryCode.Us],
    });

    const institution = institutionResponse.data.institution;

    // Store the Plaid item in our database
    await db.plaidItem.create({
      data: {
        id: nanoid(),
        budgetAccountId: metadata.budgetAccountId, // You'll need to pass this from the client
        userId: session.user.id,
        plaidItemId: itemId,
        plaidAccessToken: accessToken,
        plaidInstitutionId: institution.institution_id,
        plaidInstitutionName: institution.name,
        status: "active",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

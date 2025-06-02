import { NextResponse } from "next/server";
import { syncPlaidTransactions } from "@/lib/plaid-sync";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    // Verify the request is from a trusted source (e.g., Vercel Cron)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await syncPlaidTransactions();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Plaid sync cron job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

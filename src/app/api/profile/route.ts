import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { eq } from "drizzle-orm";
import { user } from "@/db/auth-schema";

export async function PUT(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, phoneNumber } = await request.json();

        // Update user profile
        await db
            .update(user)
            .set({
                name: name || undefined,
                phoneNumber: phoneNumber || undefined,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile
        const [userProfile] = await db.select().from(user).where(eq(user.id, session.user.id));

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            name: userProfile.name,
            email: userProfile.email,
            phoneNumber: userProfile.phoneNumber,
            image: userProfile.image,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

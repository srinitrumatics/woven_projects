import { NextRequest, NextResponse } from "next/server";
import { salesforceUpdateProfile } from "@/lib/salesforce-auth";
import { encrypt, decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ...profileData } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const result = await salesforceUpdateProfile(userId, profileData);

        if (result.success) {
            // Update the session cookie with new user_details
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('session')?.value;
            
            if (sessionCookie) {
                const currentSession = await decrypt(sessionCookie);
                if (currentSession) {
                    const updatedContact = (Array.isArray(result.data) && result.data.length > 0) 
                        ? result.data[0] 
                        : (result.data || profileData);

                    const updatedSession = {
                        ...currentSession,
                        user_details: {
                            ...(currentSession.user_details || {}),
                            ...updatedContact
                        }
                    };
                    
                    const encryptedSession = await encrypt(updatedSession);
                    cookieStore.set('session', encryptedSession, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        expires: currentSession.expires ? new Date(currentSession.expires) : undefined,
                        path: '/',
                    });
                }
            }

            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message || "Failed to update profile" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}

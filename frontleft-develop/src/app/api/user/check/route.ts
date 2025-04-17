import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { useStytchUser } from "@stytch/nextjs";
import { getAuthenticatedUser } from "@/app/lib/stytch";



export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = await getAuthenticatedUser(request);
    if (!user) {  
    return NextResponse.json({ error: 'You are not logged in' }, { status: 401 });
  }
    const phoneNumber = searchParams.get('phoneNumber');
    
    
    // Check your database if a user with this Stytch ID exists
    const userExists = await prisma.user.findUnique({
        where: {
            id: user.user_id
        }
    })

    return Response.json({ userExists });
}
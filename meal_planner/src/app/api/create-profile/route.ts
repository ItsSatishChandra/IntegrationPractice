import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
    const clerkUser = await currentUser();
    if (!clerkUser) {
        return NextResponse.json({ error: "User not in clerk" }, { status: 404 });
    }

    const email = clerkUser?.emailAddresses[0].emailAddress;
    if (!email) {
        return NextResponse.json(
            { error: "User does not have an email address" },
            { status: 400 }
        );
    }

    const existingProfile = await prisma?.profile.findUnique({
        where: {
            userId: clerkUser.id
        }
    });

    if (!existingProfile) {
        return NextResponse.json(
            { message: "profile already exists." },
        );
    }

    try {
        await prisma.profile.create({
            data: {
                userId: clerkUser.id,
                email: email,
    
                subscriptionTier: null,
                stripeSubscriptionId: null,
                subscriptionActive: false
            }
        });
    
        return NextResponse.json(
            { message: " Profile created Successfully" },
            { status: 201 }
        );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch (error : any){
        console.log(error.message)
        return NextResponse.json(
            {error : "Internal Error"},
            {status:500}
        )
    }
}
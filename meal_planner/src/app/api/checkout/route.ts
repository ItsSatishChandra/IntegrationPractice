import { getPriceIdFromType } from "@/app/lib/plans";
import { NextResponse } from "next/server";
import {stripe} from "@/app/lib/stripe";

export async function POST(request: Request) {
    try{

        const {planType,userId,email} = await request.json();
    
        if(!planType || !userId || !email){
            return NextResponse.json({error:"Missing required field : PlanTYpe, userID ,e mail are required"},{status:400});
        }
    
        const allowedPlanTypes = ["week","month","year"];
    
        if(!allowedPlanTypes.includes(planType)){
            return NextResponse.json({error:`Invalid plan type. ${allowedPlanTypes} are only allowed PlanTYpe`},{status:400});
        }
    
        const priceId = getPriceIdFromType(planType);
    
        if(!priceId){
            return NextResponse.json({error:`Invalid plan type. ${allowedPlanTypes} are only allowed PlanTYpe`},{status:400});
        }
    
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:[{
                price:priceId,
                quantity:1,
            }],
            customer_email:email,
            mode:"subscription",
            metadata:{
                clerkUserId:userId,
                planType:planType
            },
            success_url:`${process.env.NEXT_PUBLIC_BASE_URL!}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.NEXT_PUBLIC_BASE_URL!}/subscribe`
        });
    
        return NextResponse.json({url:session.url});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error :any){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}
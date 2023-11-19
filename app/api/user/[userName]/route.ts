import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"

interface IParams {
    userName?: string;
}

export async function GET(request: Request,{params}:{params: IParams}){
    
    try{
        const {userName} = params;
        const currentUser = await getCurrentUser();

        if (!currentUser?.id){
            return new NextResponse('Unauthorized', {status: 401});
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                name: userName
            },
        });
        if (!existingUser){
            return new NextResponse('Not Found', {status: 404});
        }
        if (currentUser.id==existingUser.id){
            return new NextResponse('Not Found', {status: 404});
        }

        return NextResponse.json(existingUser);

    } catch (error){
        //console.log(error, 'ERROR_FINDING_USER');
        return new NextResponse('Error', {status: 500});
    }
}
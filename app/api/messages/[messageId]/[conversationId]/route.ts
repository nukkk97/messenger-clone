import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    messageId?: string;
    conversationId?: string;
}

export async function DELETE( request:Request,{ params }: { params: IParams }) {
    try {
        console.log(request);
        const { messageId, conversationId } = params;
        console.log(messageId);
        console.log(conversationId);
        if (!conversationId){
            return new NextResponse('Not Found', { status: 404 });
        }
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Use `delete` instead of `deleteMany`
        const deletedMessage = await prisma.message.delete({
            where: {
                id: messageId,
                senderId: currentUser.id,
            },
        });

        await pusherServer.trigger(conversationId, 'message:update', deletedMessage);


        return NextResponse.json(deletedMessage);
    } catch (error) {
        //console.error(error, 'ERROR_CONVERSATION_DELETE');
        return new NextResponse('Error', { status: 500 });
    }
}

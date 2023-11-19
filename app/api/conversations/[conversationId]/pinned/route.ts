import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    messageId?: string;
    conversationId?: string;
}


export async function PUT(request: Request, { params }: { params: IParams }) {
    try {
        const { conversationId } = params;
        const currentUser = await getCurrentUser();
        const {messageBody} = await request.json();

        //console.log(messageBody);

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }


        // Find the message by ID and update the deletedBy field
        const updatedMessage = await prisma.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                pinned: messageBody
            },
        });

        if (conversationId)
            await pusherServer.trigger(conversationId, 'message:pinned', messageBody);

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error(error, 'ERROR_MESSAGE_PIN');
        return new NextResponse('Error', { status: 500 });
    }
}

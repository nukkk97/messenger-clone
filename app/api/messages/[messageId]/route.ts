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
        const { messageId } = params;
        const currentUser = await getCurrentUser();
        const {conversationId} = await request.json();

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }


        // Find the message by ID and update the deletedBy field
        const updatedMessage = await prisma.message.update({
            where: {
                id: messageId,
                senderId: currentUser.id
            },
            data: {
                deletedByIds: {
                    push: currentUser.id,
                },
            },
        });


        await pusherServer.trigger(conversationId, 'message:updateSingle', {
            ...updatedMessage,
            deletedByIds: [currentUser.id], // Include the deleter's ID in the array
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        //console.error(error, 'ERROR_MESSAGE_UPDATE');
        return new NextResponse('Error', { status: 500 });
    }
}

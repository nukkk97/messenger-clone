import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import type { User } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {
            userId,
            isGroup,
            members,
            name,
            isSecond
        } = body;

        if (!currentUser?.id || !currentUser?.name) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', { status: 404 });
        }
        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    users: {
                        connect: [
                            ...members.map((member: { value: string }) => ({
                                id: member.value
                            })),
                            {
                                id: currentUser.id
                            }]
                    }
                },
                include: {
                    users: true
                }
            });

            return NextResponse.json(newConversation);
        }
        if (!isSecond){
        const existingConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        userIds: {
                            equals: [currentUser.id, userId]
                        }
                    }, {
                        userIds: {
                            equals: [userId, currentUser.id]
                        }
                    }]

            }
        })
        const singleConversation = existingConversations[0];
        if (singleConversation){
            //console.log('聊天室已存在');
            return NextResponse.json(
                {message: "聊天室已存在",
                    singleConversation: singleConversation}
            );
        }
            return NextResponse.json(
                {message: "聊天室不存在"}
            );
        }
        const newConversation = await prisma.conversation.create({
            data: {
                users:{
                    connect: [{
                        id: currentUser.id
                    },{
                        id: userId
                    }
                    ]
                }
            },
            include: {
                users:true
            }
        });

        newConversation.users.map((user: User) => {
            if (user.name){
                pusherServer.trigger(user.name,'conversation:new',newConversation);
            }
        })
        //console.log('聊天室不存在');
        return NextResponse.json(newConversation);

    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}
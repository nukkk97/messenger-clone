import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";


const getMessages = async (
    conversationId: string,
) => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        return [];
    }
    try {

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
                NOT: {
                    deletedByIds: {
                        has: currentUser.id
                    },}
                
            },
            include: {
                sender: true,
                seen: true,
            },
            orderBy: {
                createAt: 'asc',
            },
        });

        return messages;
    } catch (error) {
        //console.error(error);
        return [];
    }
};

export default getMessages;

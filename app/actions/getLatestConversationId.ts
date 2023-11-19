import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getLatestConversationId = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.name) {
      return null;
    }

    const latestConversation = await prisma.conversation.findFirst({
      where: {
        users: {
          some: {
            id: currentUser.id,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    return latestConversation?.id || null;
  } catch (error) {
    return null;
  }
};

export default getLatestConversationId;
import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

const getUsers = async () => {
    const session = await getSession();
    if (!session?.user?.name){
        return [];
    }
    try{
        const users = await prisma.user.findMany({
            orderBy: {
                createAt: 'desc'
            },
            where: {
                NOT: {
                    name: session.user.name
                }
            }
        });
        return users;
    }
    catch (error){
        return [];
    }
}

export default getUsers;
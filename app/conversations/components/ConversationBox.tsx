'use client';
import { useEffect } from "react";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
//import { Conversation, Message, User } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import type { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/app/components/Avatar";
//import useCurrentUserId from "@/app/hooks/useCurrentUserId";

interface ConversationBoxProps {
    data: FullConversationType,
    selected?: boolean,
    latestId?: string|null,
    currentUserId: string|undefined
}

function ConversationBox({
    data,
    selected,
    latestId,
    currentUserId
}:ConversationBoxProps){
    const otherUser = useOtherUser(data);

    //const currentUserId = useCurrentUserId(data);

    const session = useSession();
    const router = useRouter();
    useEffect(() => {
        if (latestId) {
            router.push(`/conversations/${latestId}`);
        }
    }, [latestId, router]);
    const handleClick = useCallback(() => {
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    const lastMessage = useMemo(() => {
        const messages = data.messages || [];

        return messages[messages.length - 1];
    }, [data.messages]);

    const userName = useMemo(() => {
        return session.data?.user?.name;
    }, [session.data?.user?.name]);

    const hasSeen = useMemo(() => {
        if (!lastMessage) {
            return false;
        }

        const seenArray = lastMessage.seen || [];

        if (!userName) {
            return false;
        }

        return seenArray.filter((user) => user.name == userName).length !== 0;
    }, [userName, lastMessage]);

    const lastMessageText = useMemo(() => {
        if (lastMessage==null){
            return '你們還沒開始聊天！';
        }
        
        if (currentUserId&&lastMessage.deletedByIds.includes(currentUserId)){
            return '你已對自己刪除訊息！';
        }
        if (lastMessage?.image) {
            return '傳送了一張圖片！';
        }

        if (lastMessage?.body) {
            return lastMessage.body;
        }
    
    }, [lastMessage,currentUserId])

    return (
        <div onClick={handleClick}
            className={clsx(`
    w-full
    relative
    flex
    items-center
    space-x-3
    hover:bg-neutral-100
    rounded-lg
    transition
    cursor-pointer
    p-3
    `,
                selected ? 'bg-neutral-100' : 'bg-white')}>
            <Avatar user={otherUser} />
            <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-md font-medium text-gray-900">
                            {data.name || otherUser.name}
                        </p>
                        {lastMessage?.createAt && (<p
                            className="text-xs
                    text-gray-400
                    font-light">{
                                format(new Date(lastMessage.createAt), 'p')}</p>)}
                    </div>
                    <p className={clsx(`
                truncate
                text-sm`, hasSeen ? 'text-gray-500' : 'text-black font-medium')}>
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ConversationBox;
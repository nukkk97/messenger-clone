'use client';
import { FaBullhorn } from 'react-icons/fa';
import useOtherUser from "@/app/hooks/useOtherUser";
import type { Conversation, User } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2";
import Avatar from "@/app/components/Avatar";
import ProfileDrawer from "./ProfileDrawer";
import { pusherClient } from "@/app/libs/pusher";
import useActiveList from '@/app/hooks/useActiveList';

interface HeaderProps {
    conversation: Conversation & {
        users: User[]
    }
};

function Header({
    conversation
}:HeaderProps){
    const otherUser = useOtherUser(conversation);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { members } = useActiveList();

    const isActive = otherUser?.name !== undefined && members.indexOf(otherUser.name) !== -1;

    const statusText = useMemo(() => {
        if (conversation.isGroup) {
            return `${conversation.users.length} members`;
        }

        return isActive ? '上線中' : '不在線';
    }, [conversation,isActive]);
    const [pinnedMessage, setPinnedMessage] = useState(conversation.pinned);

    useEffect(() => {
        pusherClient.subscribe(conversation.id);
        const handlePinnedEvent = (messageBody: string) => {
            // Check if the event is for the current conversation
            setPinnedMessage(messageBody);
        };
        // Subscribe to the Pusher event for pinned messages
        pusherClient.bind('message:pinned', handlePinnedEvent);




        // Cleanup on component unmount
        return () => {
            pusherClient.unsubscribe(conversation.id);
            pusherClient.unbind('message:pinned', handlePinnedEvent);
        };
    }, [conversation.id, isActive]);



    return (
        <>
            <ProfileDrawer
                data={conversation}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)} />
            <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6
        justify-between items-center shadow-sm">
                <div className="flex gap-3 items-center">
                    <Link
                        className="lg:hidden
                block
                text-sky-500
                hover:text-sky-600
                transition
                cursor-pointer"
                        href="/conversations">
                        <HiChevronLeft size={32} />
                    </Link>
                    <Avatar user={otherUser} />
                    <div className="flex flex-col">
                        <div>
                            {conversation.name || otherUser.name}
                        </div>
                        <div className="text-sm font-light text-neutral-500">
                            {statusText}
                        </div>
                    </div>
                </div>
                <div>
                    {pinnedMessage&&<div>
                        <p className='marquee'>
                            <FaBullhorn style={{ color: 'gray', marginRight: '5px' }} />
                            公告：{pinnedMessage}
                        </p>
                    </div>}
                </div>
                <HiEllipsisHorizontal
                    size={32}
                    onClick={() => setDrawerOpen(true)}
                    className="
            text-sky-500
            cursor-pointer
            hover:text-sky-600
            transition"
                />
            </div>
        </>
    );
}
export default Header;
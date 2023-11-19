'use client'

import type { FullConversationType } from "@/app/types";
import ConversationBox from "./ConversationBox";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useConversation from "@/app/hooks/useConversation";
import clsx from "clsx";
import { MdPersonAdd } from "react-icons/md"
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
    initialItems: FullConversationType[];
    latestId: string | null;
    currentUserId: string | undefined;
}

function ConversationList({
    initialItems,
    latestId,
    currentUserId
}:ConversationListProps){

    const [items, setItems] = useState(initialItems);

    const router = useRouter();

    const { conversationId, isOpen } = useConversation();

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            try {
                const response = await fetch(`/api/user/${userName}`);

                if (response.ok) {
                    const data = await response.json();
                    const userid = data.id;
                    //const userId = data.id;
                    //alert(`User ID for ${userName}: ${userId}`);
                    //create a chat with userId
                    axios.post('/api/conversations', {
                        userId: data.id,
                        isSecond: 0
                    }).then((data2) => {
                        if (data2.data.message == '聊天室已存在') {
                            toast.success(data2.data.message);
                            router.push(`/conversations/${data2.data.singleConversation.id}`);
                        }
                        else {
                            const result = window.confirm('聊天室不存在，是否新增聊天室？');
                            if (result) {
                                axios.post('/api/conversations', {
                                    userId: userid,
                                    isSecond: 1
                                }).then((data) => {
                                    toast.success('成功創建聊天室！');
                                    router.push(`/conversations/${data.data.id}`);
                                })
                            }
                            else {
                                toast.error('未創建聊天室！');
                            }
                        }
                    })
                } else {
                    toast.error('用戶不存在！');
                }
            } catch (error) {
                //console.error(error);
                toast.error('搜尋失敗！');
            }
        }
    };
    const [userName, setSearchValue] = useState("");
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };
    const [isHovered, setIsHovered] = useState(false);
    const [openBar, setOpenBar] = useState(false);
    const handleClick = () => {
        setOpenBar(!openBar);
    }
    const session = useSession();
    const pusherKey = useMemo(()=>{
        return session.data?.user?.name;
    },[session.data?.user?.name])

    useEffect(()=>{
        if (!pusherKey){
            return;
        }

        pusherClient.subscribe(pusherKey);
        const newHandler = (conversation: FullConversationType) => {
            setItems((current)=>{
                if (find(current, {id: conversation.id})){
                    return current;
                }

                return [conversation, ...current];
            });
        };
        const updateHandler = (conversation: FullConversationType) => {
            setItems((current) => current.map((currentConversation) => {
                if (currentConversation.id == conversation.id){
                    return {
                        ...currentConversation,
                        messages: conversation.messages
                    }
                }
                return currentConversation;
            }))
        }
        const removeHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                return [...current.filter((conv) => conv.id !== conversation.id)]
            });

            if (conversationId == conversation.id){
                router.push('/conversations');
            }
        };
        pusherClient.bind('conversation:new', newHandler);
        pusherClient.bind('conversation:update',updateHandler);
        pusherClient.bind('conversation:remove',removeHandler);
        return () => {
            pusherClient.unsubscribe(pusherKey);
            pusherClient.unbind('conversation:new', newHandler);
            pusherClient.unbind('conversation:update', updateHandler);
            pusherClient.unbind('conversation:remove',removeHandler);
        }  
    },[pusherKey,conversationId,router]);


    return (
        <div>
            <aside
                className={clsx(`
      fixed
      inset-y-0
      pb-20
      lg:pb-0
      lg:left-20
      lg:w-80
      lg:block
      overflow-y-quto
      border-r
      border-gray-200
    `, isOpen ? 'hidden' : 'block w-full left-0')}
            >
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="text-2xl font-bold text-neutral-800">
                            訊息列表
                        </div>
                        <div onClick={handleClick} onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)} className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition">
                            <MdPersonAdd size={20} />{isHovered && (
                                <div className="text-[10px]">
                                    搜尋或新增
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Beautiful Search Bar */}
                    {openBar && <div className="mb-4">
                        <input
                            type="text"
                            placeholder="搜尋其他用戶（按Enter搜尋）..."
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-sky-500 transition"
                            onKeyDown={handleKeyPress}
                            onChange={handleSearch}
                        />
                    </div>}

                    {items.map((item) => (
                        <ConversationBox
                            key={item.id}
                            data={item}
                            selected={conversationId === item.id}
                            latestId={latestId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            </aside>
        </div>

    );
}
export default ConversationList;
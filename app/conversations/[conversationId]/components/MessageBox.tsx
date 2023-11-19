'use client';

import Avatar from "@/app/components/Avatar";
import type { FullMessageType } from "@/app/types";
import axios from "axios";
import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback } from "react";
import toast from "react-hot-toast";

interface MessageBoxProps {
    data: FullMessageType;
    isLast?: boolean;
    messageId: string;
    conversationId: string;
    messageBody: string|null;
}

function MessageBox({
    data,
    isLast,
    messageId,
    messageBody,
    conversationId
}:MessageBoxProps){
    const onDelete = useCallback(() => {
        axios.delete(`/api/messages/${messageId}/${conversationId}`)
            .catch(() => toast.error('你不是月夜Ｖ，不可以刪別人訊息'))
    }, [messageId,conversationId]);
    const onPut = useCallback(() => {
        axios.put(`/api/messages/${messageId}`,{conversationId})
            .catch(() => toast.error('你不是月夜Ｖ，不可以刪別人訊息'))
    }, [messageId,conversationId]);
    const onPin = useCallback(() => {
        //alert(`${messageId}`);
        if (messageBody){
        axios.put(`/api/conversations/${conversationId}/pinned`,{messageBody})
        .catch(() => toast.error('釘選失敗'))
        .then(() => toast.success('釘選成功'))}
        else{
            toast.error('目前不開放釘選圖片\n課金購買messenger pro後解鎖',{style: {
                minWidth: "100px", // Adjust the width as needed
                textAlign: "center",
              }});
        }
    },[conversationId,messageBody]);
    
    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 2) {
            e.preventDefault();
    
            const contextMenu = document.createElement('div');
            contextMenu.className = 'custom-context-menu';
            contextMenu.style.position = 'fixed';
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.backgroundColor = '#00c6fc';
            contextMenu.style.border = '1px solid #d4d4d4';
            contextMenu.style.borderRadius = '16px';
            contextMenu.style.boxShadow = '0px 2px 10px rgba(0, 0, 0, 0.1)';
            contextMenu.style.width = '150px'; // Adjust the width based on your content
            contextMenu.style.zIndex = '1000';
    
            const optionStyle = {
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'black',
                borderBottom: '1px solid #d4d4d4',
                transition: 'background-color 0.3s',
            };
    
            const option1 = document.createElement('div');
            option1.innerText = '對自己收回';
            Object.assign(option1.style, optionStyle);
            option1.addEventListener('click', () => handleContextMenuOptionClick('對自己收回'));
    
            const option2 = document.createElement('div');
            option2.innerText = '對全部人收回';
            Object.assign(option2.style, optionStyle);
            option2.addEventListener('click', () => handleContextMenuOptionClick('對全部人收回'));

            const option3 = document.createElement('div');
            option3.innerText = '釘選訊息';
            Object.assign(option3.style, optionStyle);
            option3.addEventListener('click', () => handleContextMenuOptionClick('釘選訊息'));

            contextMenu.appendChild(option3);
            contextMenu.appendChild(option1);
            contextMenu.appendChild(option2);
            
    
            document.body.appendChild(contextMenu);
    
            // Add a click event listener to the document to close the context menu when clicked outside
            document.addEventListener('click', handleDocumentClick);
    
        }
    };
    
    const handleContextMenuOptionClick = async (option: string) => {
        //alert(`訊息id: ${messageId} Selected option: ${option}`);
        if (option == '對全部人收回')
            onDelete();
        else if (option == '對自己收回')
            onPut();
        else
            onPin();
        closeContextMenu();
    };
    
    const handleDocumentClick = (e: MouseEvent) => {
        const contextMenu = document.querySelector('.custom-context-menu');
        if (contextMenu && !contextMenu.contains(e.target as Node)) {
            closeContextMenu();
        }
    };
    
    const closeContextMenu = () => {
        const contextMenu = document.querySelector('.custom-context-menu');
        if (contextMenu) {
            contextMenu.remove();
            document.removeEventListener('click', handleDocumentClick);
        }
    };
    const session = useSession();

    const isOwn = session?.data?.user?.name == data?.sender?.name;
    const seenList = (data.seen || [])
        .filter((user) => user.name !== data?.sender?.name)
        .map((user) => user.name)
        .join(', ');

    const container = clsx(
        "flex gap-3 p-4", isOwn && "justify-end");
    const avatar = clsx(isOwn && "order-2");

    const body = clsx(
        "flex flex-col gap-2",
        isOwn && "items-end"
    );
    const message = clsx(
        "text-sm w-fit overflow-hidden",
        isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
        data.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
    );


    return (
        <>
        {data.sender&&
        <div className={container}>
            <div className={avatar}>
                <Avatar user={data.sender} />
            </div>
            <div className={body}>
                <div className="flex items-center gap-1">
                    <div className="text-sm text-gray-500">
                        {data.sender?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                        {format(new Date(data.createAt), 'p')}
                    </div>
                </div>
                {(<div className={message} onContextMenu={(e) => handleRightClick(e)}>
                    {data.image ? (
                        <Image
                            alt="Image"
                            height="288"
                            width="288"
                            src={data.image}
                            className="
                        object-cover
                        cursor-pointer
                        hover:scale-110
                        transition
                        translate"/>
                    ) : (
                        <div>{data.body}</div>
                    )}
                </div>)}
                {isLast && isOwn && seenList.length > 0 && (
                    <div
                        className="
            text-xs 
            font-light 
            text-gray-500
            "
                    >
                        {`已讀不回`}
                    </div>
                )}
            </div>
        </div>}
        </>
    );
}
export default MessageBox;
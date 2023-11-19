'use client';

import useConversation from "@/app/hooks/useConversation";
import type { FullMessageType } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";
import { pusherClient } from "@/app/libs/pusher";
import {find} from "lodash";
interface BodyProps {
    initialMessages: FullMessageType[]
    currentUserId: string|null
}
function Body({
    initialMessages,
    currentUserId
}:BodyProps){
    const [messages, setMessages] = useState(initialMessages);

    const bottomRef = useRef<HTMLDivElement>(null);

    const { conversationId } = useConversation();
    

    useEffect(() => {
        axios.post(`/api/conversations/${conversationId}/seen`);
    },[conversationId]);

    useEffect(() => {
        pusherClient.subscribe(conversationId);
        bottomRef?.current?.scrollIntoView();
    
        const messageHandler = (message: FullMessageType) => {
          axios.post(`/api/conversations/${conversationId}/seen`);
    
          setMessages((current) => {
            if (find(current, { id: message.id })) {
              return current;
            }
    
            return [...current, message]
          });
          
          bottomRef?.current?.scrollIntoView();
        };
    
        const updateMessageHandler = (newMessage: FullMessageType) => {
          setMessages((current) => current.map((currentMessage) => {
            if (currentMessage.id === newMessage.id) {
              return newMessage;
            }
            
            return currentMessage;
          }))
        };
        const updateMessageHandler2 = (newMessage: FullMessageType) => {
          if (currentUserId&&newMessage.deletedByIds.includes(currentUserId)) {
              setMessages((current) => current.filter((currentMessage) => currentMessage.id !== newMessage.id));
          }
              
      };
      
    
        pusherClient.bind('messages:new', messageHandler)
        pusherClient.bind('message:update', updateMessageHandler);
        pusherClient.bind('message:updateSingle', updateMessageHandler2);
    
        return () => {
          pusherClient.unsubscribe(conversationId)
          pusherClient.unbind('messages:new', messageHandler)
          pusherClient.unbind('message:update', updateMessageHandler)
        }
      }, [conversationId,currentUserId]);

    return (
        <div className="flex-1 overflow-y-auto">
                {messages.map((message,i) => (
                    <MessageBox
                    isLast={i == messages.length-1}
                    key={message.id}
                    data={message}
                    messageId={message.id}
                    conversationId={conversationId}
                    messageBody={message.body}
                    />
                ))}
            <div ref={bottomRef} className="pt-24"/>
        </div>
    );
}

export default Body;
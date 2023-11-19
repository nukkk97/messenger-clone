import { useEffect, useState } from "react";
import useActiveList from "./useActiveList";
import type { Channel, Members } from "pusher-js";
import { pusherClient } from "../libs/pusher";

interface PusherMember {
    id: string;
}

const useActiveChannel = () => {
    const { set, add, remove } = useActiveList();
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

    useEffect(() => {
        let channel = activeChannel;

        if (!channel) {
            channel = pusherClient.subscribe('presence-messenger');
            setActiveChannel(channel);
        }

        channel.bind('pusher:subscription_succeeded', (members: Members) => {
            const initialMembers: string[] = [];
            members.each((member: PusherMember) => initialMembers.push(member.id));
            set(initialMembers);
        });

        channel.bind("pusher:member_added", (member: PusherMember) => {
            add(member.id);
        });

        channel.bind("pusher:member_removed", (member: PusherMember) => {
            remove(member.id);
        });

        return () => {
            if (activeChannel) {
                pusherClient.unsubscribe('presence-messenger');
                setActiveChannel(null);
            }
        };
    }, [activeChannel, set, add, remove]);
};

export default useActiveChannel;

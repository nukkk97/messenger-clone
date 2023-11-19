'use client';

import type { User } from "@prisma/client";
import Image from "next/image"
import useActiveList from "../hooks/useActiveList";
interface AvatarProps {
    user?: User;
}

function Avatar({ user }: AvatarProps) {
    const {members} = useActiveList();
    const isActive = user?.name && members.indexOf(user.name) !== -1;
    return (
        <div className="relative">
            <div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
                <Image alt="Avatar" src={user?.image || '/images/placeholder.jpeg'} fill/>
            </div>
            {isActive&&<span className="absolute
            block
            rounded-full
            bg-green-500
            ring-2
            ring-white
            top-0
            right-0
            h-2
            w-2
            md:h-3
            md:w-3"/>}
        </div>
    )
}
export default Avatar;
// ChatSidebar.jsx
import { usePage } from "@inertiajs/react";
import React from "react";
import ActiveChats from "./ActiveChats";

const ChatSidebar = ({ onChatSelect }) => {
    const { props } = usePage();
    const friends = props.friends || [];
    console.log(props);

    const handleChatClick = (friend) => {
        onChatSelect(friend);
    };

    return (
        <div className="w-full md:w-96 h-screen bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-40 overflow-y-auto ">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <h2 className="text-xl font-bold text-[#214478] title">
                    Chats Privados
                </h2>
            </div>

            {/* Lista de chats */}
            <ActiveChats friends={friends} onChatSelect={handleChatClick}></ActiveChats>
        </div>
    );
};

export default ChatSidebar;

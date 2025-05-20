// ChatSidebar.jsx
import React from "react";

const ChatSidebar = ({ friends = [], onChatSelect }) => {
    const handleChatClick = (friend) => {
        onChatSelect(friend);
    };

    return (
        <div className="w-full md:w-96 h-screen bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-40 overflow-y-auto ">
            {console.log(friends)}

            {/* Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <h2 className="text-xl font-bold text-[#214478] title">
                    Chats Privados
                </h2>
            </div>

            {/* Lista de chats */}
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <li
                            key={friend.id}
                            className="p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
                            onClick={() => handleChatClick(friend)}
                        >
                            {console.log(friend)}
                            <div className="flex items-center gap-3">
                                {friend.avatarURL ? ( // Cambiado de profile_photo_url a avatarURL
                                    <img
                                        src={friend.avatarURL} // Cambiado de profile_photo_url a avatarURL
                                        alt={friend.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                                        {friend.name}
                                    </p>
                                    {friend.last_message && (
                                        <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                                            {friend.last_message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No tienes amigos para chatear.
                    </li>
                )}
            </ul>
        </div>
    );
};

export default ChatSidebar;

// ChatSidebar.jsx
import React from "react";
import { faker } from "@faker-js/faker"; // Importa la librería Faker para datos realistas

// Función para crear un usuario falso con datos coherentes con el modelo de Laravel
const createFakeUser = () => ({
    id: faker.number.int(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    avatarURL: faker.image.avatar(),
    roleId: faker.number.int({ min: 1, max: 5 }), // Simula un roleId
    last_message: faker.lorem.sentence(),
    // Puedes añadir más campos si los necesitas para la lista
});

const ChatSidebar = ({ followers, onChatSelect }) => {
    // Genera una lista de usuarios falsos para simular los seguidores
    const fakeFollowers = Array.from({ length: 10 }, () => createFakeUser());

    const handleChatClick = (follower) => {
        onChatSelect(follower);
    };

    return (
        <div className="w-full md:w-96 h-screen bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-40 overflow-y-auto shadow-lg">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <h2 className="text-xl font-bold text-[#214478] title">
                    Chats Privados
                </h2>
            </div>

            {/* Lista de chats */}
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {fakeFollowers.map((follower) => (
                    <li
                        key={follower.id}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900`}
                        onClick={() => handleChatClick(follower)}
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={follower.avatarURL}
                                alt={follower.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm font-medium truncate text-gray-900 dark:text-gray-100`}
                                >
                                    {follower.name}
                                </p>
                                <p
                                    className={`text-xs truncate text-gray-500 dark:text-gray-400`}
                                >
                                    {follower.last_message}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
                {fakeFollowers.length === 0 && (
                    <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No tienes seguidores para chatear.
                    </li>
                )}
            </ul>
        </div>
    );
};

export default ChatSidebar;

import React from "react";
import { faker } from "@faker-js/faker";

// Función para crear un mensaje falso
const createFakeMessage = (senderId, receiverId, isSentByUser) => ({
    id: faker.number.int(),
    user_sender_id: senderId,
    user_receiver_id: receiverId,
    content: faker.lorem.sentence(),
    imageURL: faker.image.url(), // O null si no hay imagen
    read: faker.datatype.boolean(),
    sent_at: faker.date.past(),
    isSentByUser: isSentByUser, // Indica si el mensaje lo envió el usuario actual
});

const ChatWindow = ({ selectedChat, onClose }) => {
    // Simula el ID del usuario actual
    const currentUserId = 123;

    // Genera algunos mensajes de ejemplo
    const fakeMessages = [
        createFakeMessage(currentUserId, selectedChat.id, true), // Mensaje enviado por el usuario
        createFakeMessage(selectedChat.id, currentUserId, false), // Mensaje recibido por el usuario
        createFakeMessage(currentUserId, selectedChat.id, true),
        createFakeMessage(selectedChat.id, currentUserId, false),
        createFakeMessage(currentUserId, selectedChat.id, true),
        createFakeMessage(selectedChat.id, currentUserId, false),
        createFakeMessage(currentUserId, selectedChat.id, true),
    ].sort((a, b) => a.sent_at.getTime() - b.sent_at.getTime()); // Ordenar por fecha de envío

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            {/* Header del chat (sticky) */}
            <div className="sticky top-0 bg-white dark:bg-black z-10 p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={onClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-[#214478]"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <img
                    src={selectedChat.avatarURL}
                    alt={selectedChat.name}
                    className="h-10 w-10 rounded-full object-cover"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChat.name}
                </h3>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto text-gray-700 dark:text-gray-200 space-y-2">
                {fakeMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.isSentByUser
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`rounded-lg py-2 px-3 ${
                                message.isSentByUser
                                    ? "bg-[#214478] text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            } max-w-xs`}
                        >
                            <p className="text-sm">{message.content}</p>
                            {message.imageURL && (
                                <img
                                    src={message.imageURL}
                                    alt="Mensaje adjunto"
                                    className="mt-1 rounded-md max-h-48 object-cover"
                                />
                            )}
                            <span
                                className={`text-xs ${
                                    message.isSentByUser
                                        ? "text-white/70"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {new Date(message.sent_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input para mensaje (sticky) */}
            <div className="sticky bottom-0 bg-white dark:bg-black z-10 p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <textarea
                        rows={1}
                        placeholder="Escribe un mensaje..."
                        className="w-full resize-none overflow-hidden px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-[#214478] focus:border-[#214478] focus:outline-none"
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                    <button className="mt-3 w-full bg-[#214478] hover:bg-[#1a365e] text-white font-semibold py-2 px-4 rounded-md transition">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

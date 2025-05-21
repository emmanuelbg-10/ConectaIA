import React, { useState, useEffect, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: "fe9bb49ebd480f64f723",
    cluster: "eu",
    forceTLS: true,
});

// El componente ChatWindow recibe las props: selectedChat, messages, currentUserId y onClose
const ChatWindow = ({
    selectedChat,
    messages,
    currentUserId,
    onClose,
    setMessages,
}) => {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Si no hay un chat seleccionado, no renderiza nada
    if (!selectedChat) return null;

    // // Refresca los mensajes cada 2 segundos
    // useEffect(() => {
    //     if (!selectedChat) return;
    //     const interval = setInterval(async () => {
    //         const res = await fetch(`/messages/${selectedChat.id}`);
    //         if (res.ok) {
    //             const msgs = await res.json();
    //             setMessages(msgs);
    //         }
    //     }, 2000);

    //     return () => clearInterval(interval);
    // }, [selectedChat, setMessages]);

    // Función para enviar el mensaje
    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const res = await fetch("/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]'
                ).content,
            },
            body: JSON.stringify({
                receiver_id: selectedChat.id,
                content: newMessage,
            }),
        });

        if (res.ok) {
            setNewMessage("");
            // No agregues el mensaje aquí, lo recibirás por el evento
        }
    };

    useEffect(() => {
        if (!selectedChat) return;

        const ids = [currentUserId, selectedChat.id].sort();
        const channelName = `chat.${ids[0]}.${ids[1]}`;

        console.log("Suscribiendo a:", channelName);
        console.log("currentUserId en ChatWindow:", currentUserId);

        window.Echo.channel(channelName).listen(
            ".MessageSent",
            (e) => {
                console.log("Evento recibido:", e);
                setMessages((prev) => [...prev, e.message]);
            }
        );

        return () => {
            window.Echo.leave(channelName);
        };
    }, [selectedChat, currentUserId]);

    // Scroll automático al último mensaje
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, selectedChat]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            {/* Header del chat (sticky) */}
            <div className="sticky top-0 bg-white dark:bg-black z-10 p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
                {/* Botón para cerrar el chat */}
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
                {/* Avatar del usuario con el que se está chateando */}
                {selectedChat.avatarURL ? (
                    <img
                        src={selectedChat.avatarURL}
                        alt={selectedChat.name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {selectedChat.name.charAt(0).toUpperCase()}
                    </div>
                )}
                {/* Nombre del usuario con el que se está chateando */}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChat.name}
                </h3>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto text-gray-700 dark:text-gray-200 space-y-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.user_sender_id === currentUserId
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`rounded-lg py-2 px-3 ${
                                message.user_sender_id === currentUserId
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
                                    message.user_sender_id === currentUserId
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
                {/* Este div invisible es el ancla para el scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input para mensaje (sticky) */}
            <div className="sticky bottom-0 bg-white dark:bg-black z-10 p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <textarea
                        rows={1}
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full resize-none overflow-hidden px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-[#214478] focus:border-[#214478] focus:outline-none"
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        className="mt-3 w-full bg-[#214478] hover:bg-[#1a365e] text-white font-semibold py-2 px-4 rounded-md transition"
                        onClick={handleSend}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

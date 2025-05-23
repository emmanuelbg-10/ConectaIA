import React, { useState, useEffect, useRef } from "react";
import { FiX, FiImage, FiSend } from "react-icons/fi";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "pusher",
    key: "fe9bb49ebd480f64f723",
    cluster: "eu",
    forceTLS: true,
});

// Sonido de notificación usando archivo local
const messageSound = new Audio("/audio/pop.mp3");
messageSound.volume = 0.5;

const ChatWindow = ({
    selectedChat,
    messages,
    currentUserId,
    onClose,
    setMessages,
    onShowImageModal
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageClick = (imageURL) => {
        if (onShowImageModal) {
            onShowImageModal(imageURL);
        }
    };

    useEffect(() => {
        if (!selectedChat) return;
        const ids = [currentUserId, selectedChat.id].sort();
        const channelName = `chat.${ids[0]}.${ids[1]}`;
        const channel = echo.channel(channelName);
        console.log("Escuchando en canal:", channelName);
        channel.listen(".MessageSent", (e) => {
            console.log("Mensaje recibido vía Pusher:", e.message);
            setMessages((prev) => [...prev, e.message]);
        });
        return () => {
            echo.leave(channelName);
        };
    }, [selectedChat?.id, currentUserId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() && !selectedImage) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append("receiver_id", selectedChat.id);
        if (newMessage.trim()) formData.append("content", newMessage.trim());
        if (selectedImage) formData.append("image", selectedImage);

        try {
            const res = await fetch("/messages/send", {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: formData,
            });

            if (res.ok) {
                setNewMessage("");
                setSelectedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = null;

                // Reproducir sonido de mensaje
                messageSound.currentTime = 0;
                messageSound.play();
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Evita scroll vertical de la página cuando el chat está abierto
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current && window.innerWidth <= 768) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
        };
        scrollToBottom();
        window.addEventListener("resize", scrollToBottom);
        return () => window.removeEventListener("resize", scrollToBottom);
    }, [messages]);

    if (!selectedChat) return null;

    return (
        <div className="flex flex-col h-dvh">
            {/* Header fijo arriba */}
            <div className="sticky top-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20 p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 shadow-sm h-[72px] min-h-[72px] max-h-[72px]">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition-all duration-200"
                    aria-label="Cerrar chat"
                >
                    <FiX className="w-5 h-5" />
                </button>

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

                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedChat.name}
                </h3>
            </div>
            {/* Mensajes: deja espacio arriba igual a la altura del header */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide scroll-pb-24 scroll-pt-16 pt-[88px] xs:pt-0 sm:pt-16 md:pt-6">
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
                            className={`break-words overflow-hidden rounded-2xl py-3 px-4 max-w-[70%] shadow-md transition-all duration-300 ${
                                message.user_sender_id === currentUserId
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none"
                                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap break-all">
                                {message.content}
                            </p>

                            {message.imageURL && (
                                <div className="mt-2 rounded-lg overflow-hidden">
                                    <img
                                        src={message.imageURL}
                                        alt="Adjunto"
                                        className="w-full h-auto rounded-lg max-h-40 sm:max-h-56 md:max-h-72 lg:max-h-80 transition-all duration-300"
                                        onClick={() => handleImageClick(message.imageURL)}
                                    />
                                </div>
                            )}

                            <span
                                className={`text-xs block mt-1 ${
                                    message.user_sender_id === currentUserId
                                        ? "text-white/90"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {new Date(message.sent_at).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* Input Area: Asegura que el input area tenga una altura fija */}
            <div className="flex-shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 pt-3 pb-4">
                {selectedImage && (
                    <div className="mb-3 relative w-full">
                        {/* Contenedor con max-width igual a los mensajes */}
                        <div className="max-w-[70%] mx-auto">
                            <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Previsualización"
                                className="rounded-xl mx-auto max-w-[70%] h-auto shadow-md max-h-40 sm:max-h-56 md:max-h-72 lg:max-h-80 transition-transform group-hover:scale-[1.02]"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setSelectedImage(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = null;
                                }
                            }}
                            className="absolute top-2 right-2 bg-black/60 dark:bg-gray-800/80 text-white rounded-full p-1.5 hover:bg-black dark:hover:bg-gray-900 transition-colors duration-200"
                            aria-label="Eliminar imagen"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="relative group">
                    {/* Textarea */}
                    <textarea
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${Math.min(
                                e.target.scrollHeight,
                                120
                            )}px`; // Altura máxima reducida
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Escribe tu mensaje..."
                        className="w-full resize-none overflow-auto px-4 py-3 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-24 max-h-32"
                    />

                    {/* Botón de adjuntar */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-16 top-1/2 transform -translate-y-1/2 z-10 text-gray-500 hover:text-blue-500 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Adjuntar archivo"
                    >
                        <FiImage className="w-5 h-5" />
                    </button>

                    {/* Botón de enviar con spinner */}
                    <button
                        onClick={handleSend}
                        className={`absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                            newMessage.trim() || selectedImage
                                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                                : "text-gray-400 cursor-not-allowed"
                        }`}
                        aria-label="Enviar mensaje"
                        disabled={
                            (!newMessage.trim() && !selectedImage) || isLoading
                        }
                    >
                        {isLoading ? (
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                <div
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                            </div>
                        ) : (
                            <FiSend className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) =>
                        setSelectedImage(e.target.files?.[0] || null)
                    }
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ChatWindow;

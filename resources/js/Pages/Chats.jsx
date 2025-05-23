import ActiveChats from "@/Components/ActiveChats";
import ChatWindow from "@/Components/ChatWindow";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function ChatList() {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const friends = props.friends || [];
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);

    const [showImageModal, setShowImageModal] = useState(null);

    const handleShowImageModal = (imageURL) => {
        setShowImageModal(null);
        setTimeout(() => setShowImageModal(imageURL), 0);
    };

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        const res = await fetch(`/messages/${chat.id}`);
        const data = await res.json();
        setMessages(data);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1200) {
                router.visit("/publications");
            }
        };
        // Redirección inicial
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <AuthenticatedLayout
            imageURL={showImageModal}
        >
            <div className="-m-4">
                {selectedChat && (
                    <ChatWindow
                        selectedChat={selectedChat}
                        messages={messages}
                        currentUserId={authUser.id}
                        setMessages={setMessages}
                        onClose={() => setSelectedChat(null)}
                        onShowImageModal={handleShowImageModal}
                    ></ChatWindow>
                )}
                {!selectedChat && (
                    <div>
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                            <h2 className="text-xl font-bold text-[#214478] title">
                                Chats Privados
                            </h2>
                        </div>
                        <ActiveChats
                            friends={friends}
                            onChatSelect={handleChatSelect}
                        ></ActiveChats>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

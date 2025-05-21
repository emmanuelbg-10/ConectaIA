import ActiveChats from "@/Components/ActiveChats";
import ChatWindow from "@/Components/ChatWindow";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { useState } from "react";

export default function ChatList() {

  const { props } = usePage();
  const authUser = props.auth?.user;
  const friends = props.friends || [];
  const [selectedChat, setSelectedChat] = useState(null);
      const [messages, setMessages] = useState([]);

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    const res = await fetch(`/messages/${chat.id}`);
    const data = await res.json();
    setMessages(data);
  };

  return (
    <AuthenticatedLayout>
      {selectedChat && 
        <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        currentUserId={authUser.id}
        setMessages={setMessages}
        onClose={() => setSelectedChat(null)}
        ></ChatWindow>
        // <p className="text-white">Chat seleccionado: {selectedChat.id}</p>
      }
      {!selectedChat &&
        <ActiveChats friends={friends} onChatSelect={handleChatSelect}></ActiveChats>
      }
    </AuthenticatedLayout>
  )
}
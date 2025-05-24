import {
    FiHome,
    FiSearch,
    FiBell,
    FiUser,
    FiSettings,
    FiUsers,
    FiLogOut, // Make sure to import FiLogOut
} from "react-icons/fi";
import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/NavLink";
import { Link, usePage, useForm } from "@inertiajs/react"; // Import useForm
import React, { useState, useEffect } from "react";
import ChatSidebar from "@/Components/ChatSidebar";
import ChatWindow from "@/Components/ChatWindow";
import ModalAlerts from "@/Components/ModalAlerts";
import ModalSearch from "@/Components/ModalSearch";
import ModalImage from "@/Components/ModalImage";

export default function AuthenticatedLayout({ children, imageURL }) {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobileChat = windowWidth < 1200;
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showImage, setShowImage] = useState(imageURL);
    const [alertsData, setAlertsData] = useState({
        recentMessages: [],
        recentFollowers: [],
        friendRequests: [],
    });
    const [hasNewAlerts, setHasNewAlerts] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const { props } = usePage();
    const authUser = props.auth?.user;

    const { post } = useForm();

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetch("/alerts/data")
            .then((res) => res.json())
            .then((data) => {
                setAlertsData(data);
                if (
                    data.friendRequests.length > 0 ||
                    data.recentMessages.length > 0 ||
                    data.recentFollowers.length > 0
                ) {
                    setHasNewAlerts(true);
                }
            });
    }, []);

    // Sincroniza showImage con imageURL si cambia el prop
    useEffect(() => {
        setShowImage(imageURL);
    }, [imageURL]);

    const openAlerts = async () => {
        setShowAlerts(true);
        setHasNewAlerts(false);
    };

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        const res = await fetch(`/messages/${chat.id}`);
        const data = await res.json();
        setMessages(data);
    };

    const handleShowImageModal = (imageURL) => {
        setShowImage(null);
        setTimeout(() => setShowImage(imageURL), 0);
    };

  
    return (
        <div className="min-h-screen w-full bg-white text-black dark:bg-black flex">
            {/* Sidebar principal */}
            <aside className="hidden md:flex lg:flex flex-col justify-center items-center gap-8 bg-white dark:bg-black border-r dark:border-gray-800 w-64 max-w-[100vw] md:w-48 lg:w-64 py-8 fixed top-0 left-0 h-screen z-40 overflow-y-auto">
                <Link href="/publications">
                    <ApplicationLogo className="h-16 w-16 text-black dark:text-white" />
                </Link>
                <NavLink
                    href="/publications"
                    icon={FiHome}
                    label="Home"
                    active={window.location.pathname.startsWith(
                        "/publications"
                    )}
                />
                <NavLink
                    href="#"
                    icon={FiSearch}
                    label="Search"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowSearch(true);
                    }}
                />
                <div className="relative">
                    <NavLink
                        href="#"
                        icon={FiBell}
                        label="Alerts"
                        onClick={(e) => {
                            e.preventDefault();
                            openAlerts();
                        }}
                    />
                    {hasNewAlerts && (
                        <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                    )}
                </div>
                <NavLink
                    href={route("profile")}
                    icon={FiUser}
                    label="Profile"
                    active={route().current("profile")}
                />
                <NavLink
                    href={route("settings.edit")}
                    icon={FiSettings}
                    label="Settings"
                    active={route().current("settings.edit")}
                />
                {isMobileChat && (
                    <NavLink
                        href={route("chats")}
                        icon={FiUsers}
                        label="People"
                    />
                )}
            </aside>

            {/* Contenido principal y Nav inferior */}
            <div className="flex-1 flex flex-col bg-white dark:bg-black">
                <main className="flex-1 p-4 md:ml-48 lg:ml-64 relative bg-white dark:bg-black pb-16 md:pb-0">
                    {selectedChat ? (
                        <div className="-m-4 h-full">
                            {" "}
                            {/* Aseguramos que este div también ocupe h-full */}
                            <ChatWindow
                                selectedChat={selectedChat}
                                messages={messages}
                                setMessages={setMessages}
                                currentUserId={authUser.id}
                                onClose={() => setSelectedChat(null)}
                                onShowImageModal={handleShowImageModal}
                            />
                        </div>
                    ) : (
                        children
                    )}
                </main>

                {/* Nav inferior móvil */}
                <nav className="md:hidden flex fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t dark:border-gray-800 justify-around items-center h-16">
                    <NavLink
                        href="/publications"
                        icon={FiHome}
                        label="Home"
                        active={window.location.pathname.startsWith(
                            "/publications"
                        )}
                    />
                    <NavLink
                        href="#"
                        icon={FiSearch}
                        label="Search"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowSearch(true);
                        }}
                    />
                    <NavLink
                        href="#"
                        icon={FiBell}
                        label="Alerts"
                        onClick={(e) => {
                            e.preventDefault();
                            openAlerts();
                        }}
                    />
                    <Link href="/publications">
                        <ApplicationLogo className="h-8 w-8 text-black dark:text-white" />
                    </Link>
                    <NavLink
                        href={route("profile")}
                        icon={FiUser}
                        label="Profile"
                        active={route().current("profile")}
                    />
                    <NavLink
                        href={route("chats")}
                        icon={FiUsers}
                        label="People"
                    />
                    <NavLink
                        href={route("settings.edit")}
                        icon={FiSettings}
                        label="Settings"
                        active={route().current("settings.edit")}
                    />
                </nav>
            </div>

            {!isMobileChat && (
                <div className="hidden md:block sticky top-0 right-0 h-screen z-30 w-96 max-w-[100vw]">
                    <ChatSidebar onChatSelect={handleChatSelect} />
                </div>
            )}
            <ModalAlerts
                open={showAlerts}
                onClose={() => setShowAlerts(false)}
                {...alertsData}
            />
            <ModalSearch
                open={showSearch}
                onClose={() => setShowSearch(false)}
                authUser={authUser}
            />
            {showImage && (
                <ModalImage
                    open={!!showImage}
                    onClose={() => setShowImage(null)}
                    imageURL={showImage}
                />
            )}
        </div>
    );
}

import {
    FiHome,
    FiSearch,
    FiBell,
    FiUser,
    FiSettings,
    FiUsers,
} from "react-icons/fi";
import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import ChatSidebar from "@/Components/ChatSidebar";
import ChatWindow from "@/Components/ChatWindow";
import ModalAlerts from "@/Components/ModalAlerts";

export default function AuthenticatedLayout({ children, followers, friends, authUser }) {
    const [showingNavigationDropdown] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobileChat = windowWidth < 1200;
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]); // <--- AGREGA ESTA LÍNEA
    const [showAlerts, setShowAlerts] = useState(false);
    const [alertsData, setAlertsData] = useState({
        friendRequests: [],
        recentMessages: [],
        recentFollowers: [],
    });
    const [hasNewAlerts, setHasNewAlerts] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Al cargar, consulta si hay alertas nuevas
    useEffect(() => {
        fetch("/alerts/data")
            .then((res) => res.json())
            .then((data) => {
                setAlertsData(data);
                // Si hay alguna alerta, activa el puntito
                if (
                    data.friendRequests.length > 0 ||
                    data.recentMessages.length > 0 ||
                    data.recentFollowers.length > 0
                ) {
                    setHasNewAlerts(true);
                }
            });
    }, []);

    const openAlerts = async () => {
        setShowAlerts(true);
        setHasNewAlerts(false); // Quita el puntito al abrir
    };

    // Cuando selecciones un amigo en el ChatSidebar
    const handleChatSelect = async (friend) => {
        setSelectedChat(friend);
        const res = await fetch(`/messages/${friend.id}`);
        const data = await res.json();
        setMessages(data);
    };

    return (
        <div className="min-h-screen w-full bg-white text-black dark:bg-black flex">
            {/* Sidebar principal (izquierda) */}
            <aside className="hidden md:flex lg:flex flex-col justify-center items-center gap-8 bg-white dark:bg-black border-r dark:border-gray-800 w-64 max-w-[100vw] md:w-48 lg:w-64 py-8 fixed top-0 left-0 h-screen z-40 overflow-y-auto">
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 text-black dark:text-white" />
                </Link>
                <NavLink
                    href="/publications"
                    icon={FiHome}
                    label="Home"
                    active={window.location.pathname.startsWith("/publications")}
                />
                <NavLink href="/search" icon={FiSearch} label="Search" />
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
                    href={route("profile.edit")}
                    icon={FiUser}
                    label="Profile"
                    active={route().current("profile.edit")}
                />
                <NavLink href="/settings" icon={FiSettings} label="Settings" />
                {isMobileChat && (
                    <NavLink
                        href={route("chat.index")}
                        icon={FiUsers}
                        label="People"
                    />
                )}
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col bg-white dark:bg-black">
                {showingNavigationDropdown && (
                    <div className="md:hidden px-4 py-2 space-y-1 border-b dark:border-gray-800 bg-white dark:bg-black">
                        <ResponsiveNavLink
                            href="/publications"
                            active={window.location.pathname.startsWith("/publications")}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/search">
                            Search
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/alerts">
                            Alerts
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route("chat.index")}>
                            {/* Enlace al chat completo en móvil */}
                            People
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/settings">
                            Settings
                        </ResponsiveNavLink>
                    </div>
                )}

                {/* Contenido principal */}
                <main className="flex-1 p-4 md:ml-48 lg:ml-64 relative bg-white dark:bg-black">
                    {selectedChat ? (
                        <ChatWindow
                            selectedChat={selectedChat}
                            messages={messages}
                            setMessages={setMessages}
                            currentUserId={authUser.id}
                            onClose={() => setSelectedChat(null)}
                        />
                    ) : (
                        children
                    )}
                </main>

                {/* Nav inferior móvil */}
                <nav className="md:hidden flex sticky bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t dark:border-gray-800 justify-around items-center h-16">
                    <NavLink
                        href="/publications"
                        icon={FiHome}
                        label="Home"
                        active={window.location.pathname.startsWith("/publications")}
                    />
                    <NavLink href="/search" icon={FiSearch} label="Search" />
                    <NavLink
                        href="#"
                        icon={FiBell}
                        label="Alerts"
                        onClick={(e) => {
                            e.preventDefault();
                            openAlerts();
                        }}
                    />
                    <Link href="/">
                        <ApplicationLogo className="h-8 w-8 text-black dark:text-white" />
                    </Link>
                    <NavLink
                        href={route("profile.edit")}
                        icon={FiUser}
                        label="Profile"
                        active={route().current("profile.edit")}
                    />
                    <NavLink
                        href={route("chat.index")}
                        icon={FiUsers}
                        label="People"
                    />{" "}
                    {/* Botón en la nav inferior */}
                    <NavLink
                        href="/settings"
                        icon={FiSettings}
                        label="Settings"
                    />
                </nav>
            </div>
            {!isMobileChat && (
                <div className="hidden md:block sticky top-0 right-0 h-screen z-30 w-96 max-w-[100vw]">
                    <ChatSidebar
                        friends={friends}
                        onChatSelect={handleChatSelect}
                    />
                </div>
            )}
            <ModalAlerts
                open={showAlerts}
                onClose={() => setShowAlerts(false)}
                {...alertsData}
            />
        </div>
    );
}

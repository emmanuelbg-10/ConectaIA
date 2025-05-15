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
import { useState } from "react";

export default function AuthenticatedLayout({ children }) {
    const [showingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen w-full bg-white text-black dark:bg-black dark:text-white flex">
            {/* Sidebar para escritorio */}
            <aside className="hidden md:flex lg:flex flex-col justify-center items-center gap-8 bg-white dark:bg-black border-r dark:border-gray-800 w-64 max-w-[100vw] md:w-48 lg:w-64 py-8 fixed top-0 left-0 h-screen z-40 overflow-y-auto">
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 text-black dark:text-white" />
                </Link>
                <NavLink
                    href={route("dashboard")}
                    icon={FiHome}
                    label="Home"
                    active={route().current("dashboard")}
                />
                <NavLink href="/search" icon={FiSearch} label="Search" />
                <NavLink href="/notifications" icon={FiBell} label="Alerts" />
                <NavLink
                    href={route("profile.edit")}
                    icon={FiUser}
                    label="Profile"
                    active={route().current("profile.edit")}
                />
                <NavLink href="/settings" icon={FiSettings} label="Settings" />
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col bg-white dark:bg-black">
                {showingNavigationDropdown && (
                    <div className="md:hidden px-4 py-2 space-y-1 border-b dark:border-gray-800 bg-white dark:bg-black">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/search">
                            Search
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/notifications">
                            Alerts
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/users">
                            People
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/settings">
                            Settings
                        </ResponsiveNavLink>
                    </div>
                )}

                {/* Contenido principal */}
                <main className="flex-1 overflow-y-auto p-4 md:ml-48 lg:ml-64 relative bg-white dark:bg-black">
                    {children}
                </main>

                {/* Nav inferior móvil */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t dark:border-gray-800 flex justify-around items-center h-16">
                    <NavLink
                        href={route("dashboard")}
                        icon={FiHome}
                        label="Home"
                        active={route().current("dashboard")}
                    />
                    <NavLink href="/search" icon={FiSearch} label="Search" />
                    <NavLink
                        href="/notifications"
                        icon={FiBell}
                        label="Alerts"
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
                    <NavLink href="/users" icon={FiUsers} label="People" />
                    <NavLink
                        href="/settings"
                        icon={FiSettings}
                        label="Settings"
                    />
                </nav>
            </div>
        </div>
    );
}

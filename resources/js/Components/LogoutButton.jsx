import { router } from "@inertiajs/react";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
    const logout = () => {
        router.post(route("logout"));
    };

    return (
        <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-[#214478] dark:hover:text-[#214478] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#214478] transition ease-in-out duration-150"
        >
            <FiLogOut className="w-4 h-4" />
            Cerrar sesión
        </button>
    );
}

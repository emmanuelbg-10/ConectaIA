import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { FiLogOut } from "react-icons/fi";

export default function Profile({ auth }) {
    const user = auth.user;

    const hasAvatar = user.avatarURL && user.avatarURL.trim() !== "";

    return (
        <AuthenticatedLayout>
            <Head title="Perfil" />

            <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-black border dark:border-gray-800 rounded-2xl shadow-md p-8 text-center">
                {hasAvatar ? (
                    <img
                        src={user.avatarURL}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full mx-auto border-4 border-[#214478] object-cover"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-[#214478] text-5xl font-bold text-gray-700 dark:text-gray-300">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                )}

                <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
                    {user.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                </p>

                <button
                    onClick={() => router.post(route("logout"))}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#214478] text-white rounded-xl hover:opacity-90 transition-all"
                >
                    <FiLogOut />
                    Cerrar sesión
                </button>
            </div>
        </AuthenticatedLayout>
    );
}

import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { FiLogOut } from "react-icons/fi";
import AvatarUploader from "@/Components/AvatarUploader";

export default function Profile({ auth }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Perfil" />

            <AvatarUploader user={user} />

            <div className="relative max-w-xl mx-auto mt-10 bg-white dark:bg-black border dark:border-gray-800 rounded-2xl shadow-md p-8 text-center">
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

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import UpdatePasswordForm from "./UpdatePasswordForm";
import UpdateProfileInformationForm from "./UpdateProfileInformationForm";
import { Link } from "@inertiajs/react";
import DeleteUserForm from "./DeleteUserForm";

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Ajustes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-12 sm:px-6 lg:px-8">
                    {/* Mostrar enlace solo si el usuario es admin */}

                    {user && (
                        <div className="mb-4">
                            <Link
                                href={route("admin.users.index")}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Gestión Usuarios
                            </Link>
                        </div>
                    )}

                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />

                    <UpdatePasswordForm className="max-w-xl" />
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

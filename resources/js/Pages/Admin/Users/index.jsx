import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // O tu layout de admin si tienes uno
import { Head, usePage, useForm } from "@inertiajs/react";
import Pagination from "@/Components/Pagination"; // Un componente de paginación reutilizable
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal"; // Un componente Modal reutilizable
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import Swal from "sweetalert2";

export default function Index({
    auth: authProp,
    users: usersProp,
    allRoles: allRolesProp,
    success,
    error,
    authUser,
}) {
    const canEditUsers = authProp.can.edit_users;
    const canBanUsers = authProp.can.ban_users;
    const canUnbanUsers = authProp.can.unban_users;
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const {
        data,
        setData,
        put,
        post,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        id: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        roles: [],
    });

    const openEditModal = (user) => {
        reset(); // Limpiar errores y datos previos
        setData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: "",
            password_confirmation: "",
            roles: user.roles.map((role) => role.name), // Necesitamos los nombres de los roles
        });
        setEditingUser(user);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
        reset();
    };

    const submitEditForm = (e) => {
        e.preventDefault();
        put(route("admin.users.update", editingUser.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
            // onError: () => {/* puedes manejar errores específicos aquí */}
        });
    };

    const handleBanUser = (user) => {
        Swal.fire({
            title: `¿Estás seguro de que quieres banear a ${user.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, banear",
            cancelButtonText: "Cancelar",
            darkMode: document.documentElement.classList.contains("dark"), // Detecta si la clase 'dark' está en el elemento html
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route("admin.users.ban", user.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleRestoreUser = (user) => {
        Swal.fire({
            title: `¿Estás seguro de que quieres restaurar a ${user.name}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, restaurar",
            cancelButtonText: "Cancelar",
            darkMode: document.documentElement.classList.contains("dark"), // Detecta si la clase 'dark' está en el elemento html
        }).then((result) => {
            if (result.isConfirmed) {
                post(route("admin.users.restore", user.id), {
                    preserveScroll: true,
                    onSuccess: () =>
                        Swal.fire({
                            title: "Restaurado",
                            text: "El usuario ha sido restaurado.",
                            icon: "success",
                            darkMode:
                                document.documentElement.classList.contains(
                                    "dark"
                                ),
                        }),
                    onError: () =>
                        Swal.fire({
                            title: "Error",
                            text: "No se pudo restaurar el usuario.",
                            icon: "error",
                            darkMode:
                                document.documentElement.classList.contains(
                                    "dark"
                                ),
                        }),
                });
            }
        });
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl dark:text-gray-100 text-[#214478] leading-tight">
                    Gestión de Usuarios
                </h2>
            }
            children={null}
            authUser={authUser}
        >
            <Head title="Gestión de Usuarios" />

            <div className="py-12 bg-gray-100 dark:bg-black">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-500 rounded">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-500 rounded">
                            {error}
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="w-full overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="hidden md:table-header-group">
                                        <tr className="text-left font-bold text-gray-700 dark:text-gray-300">
                                            <th className="pb-4 pt-6 px-6">
                                                Nombre
                                            </th>
                                            <th className="pb-4 pt-6 px-6">
                                                Correo electrónico
                                            </th>
                                            <th className="pb-4 pt-6 px-6">
                                                Roles
                                            </th>
                                            <th className="pb-4 pt-6 px-6">
                                                Estado
                                            </th>
                                            <th className="pb-4 pt-6 px-6">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {usersProp.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="block md:table-row mb-6 md:mb-0 border-b md:border-b-0 md:border-none border-gray-200 dark:border-gray-700"
                                            >
                                                <td className="py-2 px-6 md:table-cell block break-words">
                                                    <span className="font-bold md:hidden block">
                                                        Nombre:
                                                    </span>
                                                    {user.name}
                                                </td>
                                                <td className="py-2 px-6 md:table-cell block break-words">
                                                    <span className="font-bold md:hidden block">
                                                        Correo electrónico:
                                                    </span>
                                                    {user.email}
                                                </td>
                                                <td className="py-2 px-6 md:table-cell block break-words">
                                                    <span className="font-bold md:hidden block">
                                                        Roles:
                                                    </span>
                                                    {user.roles
                                                        .map(
                                                            (role) => role.name
                                                        )
                                                        .join(", ")}
                                                </td>
                                                <td className="py-2 px-6 md:table-cell block">
                                                    <span className="font-bold md:hidden block">
                                                        Estado:
                                                    </span>
                                                    {user.deleted_at ? (
                                                        <span className="px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-full">
                                                            Baneado
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-full">
                                                            Activo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-6 md:table-cell block">
                                                    <span className="font-bold md:hidden block">
                                                        Acciones:
                                                    </span>
                                                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                                        {canEditUsers &&
                                                            !user.deleted_at && (
                                                                <SecondaryButton
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Editar
                                                                </SecondaryButton>
                                                            )}
                                                        {user.deleted_at &&
                                                            canUnbanUsers && (
                                                                <PrimaryButton
                                                                    className="bg-[#214478] hover:bg-[#183155] dark:bg-[#214478] dark:hover:bg-[#183155] text-white"
                                                                    onClick={() =>
                                                                        handleRestoreUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Restaurar
                                                                </PrimaryButton>
                                                            )}
                                                        {!user.deleted_at &&
                                                            canBanUsers &&
                                                            authUser.id !==
                                                                user.id && (
                                                                <DangerButton
                                                                    onClick={() =>
                                                                        handleBanUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Banear
                                                                </DangerButton>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersProp.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center py-4"
                                                >
                                                    No se encontraron usuarios.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <Pagination links={usersProp.links} className="mt-6" />
                </div>
            </div>

            {/* Modal para Editar Usuario */}
            <Modal show={showEditModal} onClose={closeEditModal}>
                <form
                    onSubmit={submitEditForm}
                    className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-md"
                >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Editar Usuario: {editingUser?.name}
                    </h2>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="name"
                            value="Username"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            autoComplete="name"
                            isFocused
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            autoComplete="email"
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Nueva Contraseña (opcional)"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>
                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirmar Nueva Contraseña"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="roles"
                            value="Roles"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        {allRolesProp.map((roleName) => (
                            <div
                                key={roleName}
                                className="flex items-center mt-1"
                            >
                                <input
                                    type="checkbox"
                                    id={`role-${roleName}`}
                                    value={roleName}
                                    checked={data.roles.includes(roleName)}
                                    onChange={(e) => {
                                        const selectedRoles = data.roles;
                                        if (e.target.checked) {
                                            setData("roles", [
                                                ...selectedRoles,
                                                roleName,
                                            ]);
                                        } else {
                                            setData(
                                                "roles",
                                                selectedRoles.filter(
                                                    (r) => r !== roleName
                                                )
                                            );
                                        }
                                    }}
                                    className="mr-2 rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-[#214478] shadow-sm focus:ring-[#214478] dark:focus:ring-[#214478] dark:focus:ring-offset-gray-800"
                                />
                                <label
                                    htmlFor={`role-${roleName}`}
                                    className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    {roleName}
                                </label>
                            </div>
                        ))}
                        <InputError message={errors.roles} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-between">
                        <SecondaryButton onClick={closeEditModal}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton
                            className="ml-3 bg-[#214478] hover:bg-[#183155] dark:bg-[#214478] dark:hover:bg-[#183155] text-white"
                            disabled={processing}
                        >
                            Guardar Cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

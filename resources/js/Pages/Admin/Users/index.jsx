import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // O tu layout de admin si tienes uno
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import Pagination from '@/Components/Pagination'; // Un componente de paginación reutilizable
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal'; // Un componente Modal reutilizable
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Swal from 'sweetalert2';

export default function Index({ auth: authProp, users: usersProp, allRoles: allRolesProp, success, error, authUser }) {
    const { auth: pageAuth } = usePage().props; // auth.user tiene el usuario actual y sus permisos
    const canEditUsers = authProp.can.edit_users;
    const canBanUsers = authProp.can.ban_users;
    const canUnbanUsers = authProp.can.unban_users;

    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data, setData, put, post, delete: destroy, processing, errors, reset, recentlySuccessful } = useForm({
        id: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const openEditModal = (user) => {
        reset(); // Limpiar errores y datos previos
        setData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            roles: user.roles.map(role => role.name), // Necesitamos los nombres de los roles
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
        put(route('admin.users.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
            // onError: () => {/* puedes manejar errores específicos aquí */}
        });
    };

    const handleBanUser = (user) => {
        Swal.fire({
            title: `¿Estás seguro de que quieres banear a ${user.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, banear',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.users.ban', user.id), { preserveScroll: true });
            }
        });
    };

    const handleRestoreUser = (user) => {
        Swal.fire({
            title: `¿Estás seguro de que quieres restaurar a ${user.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, restaurar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.users.restore', user.id), {
                    preserveScroll: true,
                    onSuccess: (response) => Swal.fire('Restaurado', 'El usuario ha sido restaurado.', 'success'),
                    onError: (error) => Swal.fire('Error', 'No se pudo restaurar el usuario.', 'error'),
                });
            }
        });
    };


    return (
       <AuthenticatedLayout
               header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Usuarios</h2>}
               children={null}
               authUser={authUser}
       
             >
            <Head title="Gestión de Usuarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-400 rounded">
                            {success}
                        </div>
                    )}
                    {error && (
                         <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
                            {error}
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Hacer la tabla desplazable horizontalmente en pantallas pequeñas */}
                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    <thead>
                                        <tr className="text-left font-bold">
                                            <th className="pb-4 pt-6 px-6">Username</th>
                                            <th className="pb-4 pt-6 px-6">Email</th>
                                            <th className="pb-4 pt-6 px-6">Roles</th>
                                            <th className="pb-4 pt-6 px-6">Estado</th>
                                            <th className="pb-4 pt-6 px-6">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersProp.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 focus-within:bg-gray-100">
                                                <td className="border-t px-6 py-4">{user.name}</td>
                                                <td className="border-t px-6 py-4">{user.email}</td>
                                                <td className="border-t px-6 py-4">
                                                    {user.roles.map(role => role.name).join(', ')}
                                                </td>
                                                <td className="border-t px-6 py-4">
                                                    {user.deleted_at ? (
                                                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Baneado</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Activo</span>
                                                    )}
                                                </td>
                                                <td className="border-t px-6 py-4">
                                                    {/* Ajustar los botones para que sean responsivos */}
                                                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                                        {canEditUsers && !user.deleted_at && (
                                                            <SecondaryButton onClick={() => openEditModal(user)}>
                                                                Editar
                                                            </SecondaryButton>
                                                        )}
                                                        {user.deleted_at && canUnbanUsers && (
                                                            <PrimaryButton onClick={() => handleRestoreUser(user)}>
                                                                Restaurar
                                                            </PrimaryButton>
                                                        )}
                                                        {!user.deleted_at && canBanUsers && authUser.id !== user.id && (
                                                            <DangerButton onClick={() => handleBanUser(user)}>
                                                                Banear
                                                            </DangerButton>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersProp.data.length === 0 && (
                                            <tr>
                                                <td className="border-t px-6 py-4" colSpan="5">No se encontraron usuarios.</td>
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
                <form onSubmit={submitEditForm} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Editar Usuario: {editingUser?.name}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Username" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Nueva Contraseña (opcional)" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div className="mt-4">
                        <InputLabel htmlFor="password_confirmation" value="Confirmar Nueva Contraseña" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>


                    <div className="mt-4">
                        <InputLabel htmlFor="roles" value="Roles" />
                        {/* Este es un ejemplo simple, podrías usar checkboxes o un multi-select más elegante */}
                        {allRolesProp.map(roleName => (
                            <div key={roleName} className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id={`role-${roleName}`}
                                    value={roleName}
                                    checked={data.roles.includes(roleName)}
                                    onChange={(e) => {
                                        const selectedRoles = data.roles;
                                        if (e.target.checked) {
                                            setData('roles', [...selectedRoles, roleName]);
                                        } else {
                                            setData('roles', selectedRoles.filter(r => r !== roleName));
                                        }
                                    }}
                                    className="mr-2 rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                                />
                                <label htmlFor={`role-${roleName}`} className="text-sm text-gray-700 dark:text-gray-300">{roleName}</label>
                            </div>
                        ))}
                        <InputError message={errors.roles} className="mt-2" />
                    </div>


                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEditModal}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            Guardar Cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
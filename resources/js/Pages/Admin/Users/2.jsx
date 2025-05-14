import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,  usePage  } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Index({ users , authUser }) {
   const { auth } = usePage().props;

    console.log(authUser); // Verifica si el usuario está disponible
    return (
      <AuthenticatedLayout
        header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Usuarios</h2>}
        children={null}
        authUser={authUser}

      >
        <Head title="Gestión de Usuarios" />

        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-gray-900">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="text-left font-bold">
                      <th className="pb-4 pt-6 px-6">Username</th>
                      <th className="pb-4 pt-6 px-6">Email</th>
                      <th className="pb-4 pt-6 px-6">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.data.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-100">
                        <td className="border-t px-6 py-4">{user.name}</td>
                        <td className="border-t px-6 py-4">{user.email}</td>
                        <td className="border-t px-6 py-4">
                          {user.roles.map((role) => role.name).join(', ')}
                        </td>
                      </tr>
                    ))}
                    {users.data.length === 0 && (
                      <tr>
                        <td className="border-t px-6 py-4" colSpan="3">No se encontraron usuarios.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination links={users.links} className="mt-6" />
          </div>
        </div>
      </AuthenticatedLayout>
    );
}
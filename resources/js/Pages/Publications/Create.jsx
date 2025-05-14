import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Create({ authUser }) {
    const { data, setData, post, processing, errors } = useForm({
        textContent: '',
        image: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('publications.store'));
    };

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Crear Publicación</h2>}
        >
            <Head title="Crear Publicación" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <InputLabel htmlFor="textContent" value="Contenido" />
                                    <TextInput
                                        id="textContent"
                                        type="text"
                                        name="textContent"
                                        value={data.textContent}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('textContent', e.target.value)}
                                    />
                                    <InputError message={errors.textContent} className="mt-2" />
                                </div>

                                <div className="mb-6">
                                    <InputLabel htmlFor="image" value="Imagen (Opcional)" />
                                    <input
                                        id="image"
                                        type="file"
                                        name="image"
                                        className="mt-1 block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-md file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-blue-50 file:text-blue-700
                                          hover:file:bg-blue-100"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                    />
                                    <InputError message={errors.image} className="mt-2" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Publicando...' : 'Publicar'}
                                    </PrimaryButton>

                                    <Link href={route('publications.index')} className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                        Cancelar
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
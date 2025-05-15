import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import LogoutButton from "@/Components/LogoutButton";

import { Link, useForm, usePage } from "@inertiajs/react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-medium text-[#214478] title">
                    Información del perfil
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Actualiza la información del perfil y dirección de correo de
                    tu cuenta.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-300">
                            Tu dirección de correo no está verificada.{" "}
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-[#214478] underline hover:text-[#1a3560] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#214478] focus:ring-offset-2"
                            >
                                Haz clic aquí para reenviar el correo de
                                verificación.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                Se ha enviado un nuevo enlace de verificación a
                                tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-inline space-x-8">
                        <PrimaryButton disabled={processing}>
                            Guardar
                        </PrimaryButton>

                        <LogoutButton></LogoutButton>
                    </div>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cambios guardados.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

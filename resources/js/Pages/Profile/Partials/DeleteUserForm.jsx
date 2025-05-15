import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function DeleteUserForm({ className = "" }) {
    const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmarEliminacion = () => {
        setConfirmandoEliminacion(true);
    };

    const eliminarUsuario = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => cerrarModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const cerrarModal = () => {
        setConfirmandoEliminacion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-medium text-[#214478] title">
                    Eliminar cuenta
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Una vez que se elimine tu cuenta, todos tus recursos y datos
                    serán eliminados permanentemente. Antes de eliminar tu
                    cuenta, asegúrate de descargar cualquier información que
                    desees conservar.
                </p>
            </header>

            <DangerButton onClick={confirmarEliminacion}>
                Eliminar cuenta
            </DangerButton>

            <Modal show={confirmandoEliminacion} onClose={cerrarModal}>
                <form
                    onSubmit={eliminarUsuario}
                    className="p-6 bg-white dark:bg-gray-900 rounded-md"
                >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        ¿Estás seguro de que deseas eliminar tu cuenta?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Una vez que se elimine tu cuenta, todos sus recursos y
                        datos serán eliminados permanentemente. Por favor,
                        ingresa tu contraseña para confirmar que deseas eliminar
                        tu cuenta de forma permanente.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Contraseña"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-between">
                        <SecondaryButton onClick={cerrarModal}>
                            Cancelar
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Eliminar cuenta
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}

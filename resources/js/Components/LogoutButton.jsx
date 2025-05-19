import { router } from "@inertiajs/react";
import { FiLogOut } from "react-icons/fi";
import PrimaryButton from "./PrimaryButton";

export default function LogoutButton() {
    const logout = () => {
        router.post(route("logout"), {
            onSuccess: () => {
                window.location.reload(); // Recarga la página tras logout
            },
        });
    };

    return (
        <PrimaryButton
            type="button" // <-- Esto evita el submit del formulario
            onClick={logout}
            className="inline-flex items-center gap-2 hover:border-red-600 rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none transition duration-150 ease-in-out"
        >
            <FiLogOut className="w-4 h-4 " />
            Cerrar sesión
        </PrimaryButton>
    );
}

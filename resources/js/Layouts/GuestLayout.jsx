import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo + ONECTA */}
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center space-x-2">
                        {/* Logo más grande en móvil con proporciones */}
                        <ApplicationLogo className="sm:w-10 sm:h-10 w-10 h-10 transform scale-150 sm:scale-100 text-black dark:text-white" />

                        {/* Texto "ONECTA" visible solo en escritorio */}
                        <span className="text-3xl font-bold text-black dark:text-white sm:block hidden title">
                            ONECTA
                        </span>
                    </Link>
                </div>

                {/* Contenido del formulario */}
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}

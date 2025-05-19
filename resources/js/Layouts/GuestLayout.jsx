import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import Background from "@/Components/Background";

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
            {/* Contenedor principal sobre el fondo */}
            <Background/>
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo + ONECTA */}
                    <div className="flex justify-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <ApplicationLogo className="sm:w-20 sm:h-20 w-20 h-20 transform scale-150 sm:scale-100 text-black dark:text-white" />
                            <span className="text-5xl font-bold text-black dark:text-white sm:block hidden title">
                                ONECTA
                            </span>
                        </Link>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

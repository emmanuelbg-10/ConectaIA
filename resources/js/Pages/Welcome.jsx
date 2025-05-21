import { useEffect, useState } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import Loader from "@/Components/Loader";

export default function Welcome() {
    const { auth } = usePage().props;
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        // Evita redireccionar hasta que esté montado todo
        const timeout = setTimeout(() => {
            if (auth?.user) {
                router.visit("/publications");
            } else {
                setCheckingAuth(false);
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [auth]);

    if (checkingAuth) {
        return <Loader />;
    }

    return (
        <GuestLayout>
            <Head title="Welcome" />
            <div className="max-w-xs mx-auto grid grid-cols-1 gap-4 w-full">
                <Link href={route("register")}>
                    <PrimaryButton className="w-full">Registro</PrimaryButton>
                </Link>
                <Link href={route("login")}>
                    <PrimaryButton className="w-full">
                        Iniciar sesión
                    </PrimaryButton>
                </Link>
            </div>
        </GuestLayout>
    );
}

import { useEffect, useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import Loader from "@/Components/Loader";

export default function Welcome() {
    const { auth } = usePage().props;
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        if (auth?.user) {
            router.visit("/publications");
        } else {
            const timeout = setTimeout(() => {
                setCheckingAuth(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [auth]);

    if (checkingAuth) {
        return <Loader />;
    }

    return (
        <GuestLayout>
            <Head title="Welcome" />
            <div className="grid grid-cols-1 justify-self-center gap-5">
                <PrimaryButton>
                    <Link href={route("register")}>Registro</Link>
                </PrimaryButton>
                <PrimaryButton>
                    <Link href={route("login")}>Iniciar sesión</Link>
                </PrimaryButton>
            </div>
        </GuestLayout>
    );
}

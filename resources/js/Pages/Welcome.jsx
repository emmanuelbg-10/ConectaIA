import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link } from "@inertiajs/react";

export default function Welcome() {

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

/* Welcome.layout = (page) => <GuestLayout children={page}/>; */
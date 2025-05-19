import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {

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

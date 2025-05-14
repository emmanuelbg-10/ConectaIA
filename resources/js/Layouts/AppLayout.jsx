// En resources/js/Layouts/AppLayout.jsx
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export default function AppLayout({ auth, header, children }) {
    // Manejar mensajes flash
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <>
            <Head>
                <title>{title || 'ConectaIA'}</title>
            </Head>

            <div className="min-h-screen bg-gray-100">
                {header && (
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>

            <Toaster position="top-right" richColors />
        </>
    );
}
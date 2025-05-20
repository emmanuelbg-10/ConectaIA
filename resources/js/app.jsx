import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { InertiaProgress } from "@inertiajs/progress";
import Background from './Components/Background';
import GuestLayout from "./Layouts/GuestLayout";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const isGuest = props.initialPage?.component?.toLowerCase().includes('auth/') || props.initialPage?.component === 'Welcome';
        root.render(
            <>
                {isGuest && <Background />}
                <App {...props} />
            </>
        );
    },
    progress: {
        color: "#4B5563",
        showSpinner: true,
    },
});

// Inicializa la barra de progreso
InertiaProgress.init({
    color: "#4B5563",
    showSpinner: true,
});

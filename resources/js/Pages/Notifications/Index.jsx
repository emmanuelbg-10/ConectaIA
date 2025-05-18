import { useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    FaCommentDots,
    FaHeart,
    FaRetweet,
    FaUserPlus,
    FaAt,
    FaBell,
} from "react-icons/fa";

const mockNotifications = [
    {
        id: 1,
        notificationType: "NuevoMensaje",
        notificationContent: "Has recibido un nuevo mensaje de Ana.",
        reference_id: 12,
        actor_id: 2,
        read: false,
        created_at: "2025-05-16 10:34:12",
    },
    {
        id: 2,
        notificationType: "MeGusta",
        notificationContent: "A Pedro le gustó tu publicación.",
        reference_id: 35,
        actor_id: 3,
        read: true,
        created_at: "2025-05-15 18:22:45",
    },
    {
        id: 3,
        notificationType: "Mencion",
        notificationContent: "Luis te mencionó en un comentario.",
        reference_id: 40,
        actor_id: 4,
        read: false,
        created_at: "2025-05-14 12:05:10",
    },
    {
        id: 4,
        notificationType: "NuevoSeguidor",
        notificationContent: "Clara comenzó a seguirte.",
        reference_id: 0,
        actor_id: 5,
        read: true,
        created_at: "2025-05-13 09:47:30",
    },
];

const typeIcons = {
    NuevoMensaje: <FaCommentDots className="text-xl text-blue-500" />,
    Mencion: <FaAt className="text-xl text-purple-500" />,
    MeGusta: <FaHeart className="text-xl text-red-500" />,
    Retweet: <FaRetweet className="text-xl text-green-500" />,
    NuevoSeguidor: <FaUserPlus className="text-xl text-yellow-500" />,
};

export default function NotificationsIndex({ auth }) {
    useEffect(() => {
        document.title = "Notificaciones";
    }, []);

    return (
        <AuthenticatedLayout auth={auth} followers={[]}>
            <Head title="Notificaciones" />

            <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center title">
                    Notificaciones
                </h1>

                <div className="space-y-4">
                    {mockNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl shadow-md border ${
                                notification.read
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-blue-50 dark:bg-blue-900"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {typeIcons[
                                            notification.notificationType
                                        ] || <FaBell />}
                                    </div>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {notification.notificationContent}
                                    </p>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

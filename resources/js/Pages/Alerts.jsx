import React from "react";
import { Head } from "@inertiajs/react";

export default function Alerts({
    friendRequests,
    recentMessages,
    recentFollowers,
}) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Head title="Alertas" />
            <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
                Alertas
            </h1>

            <div className="space-y-6">
                {/* Peticiones de amistad */}
                <AlertSection
                    title="Peticiones de amistad"
                    items={friendRequests}
                    emptyMessage="No tienes nuevas peticiones."
                    renderItem={(req) => (
                        <div
                            key={req.id}
                            className="flex items-center justify-between"
                        >
                            <span className="text-black dark:text-white">
                                <span className="font-medium text-[#214478] dark:text-[#214478]">
                                    {req.sender.name}
                                </span>{" "}
                                te ha enviado una petición.
                            </span>
                            <div className="flex gap-2">
                                <button className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                    Aceptar
                                </button>
                                <button className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    )}
                />

                {/* Mensajes recientes */}
                <AlertSection
                    title="Mensajes recientes"
                    items={recentMessages}
                    emptyMessage="No tienes mensajes nuevos."
                    renderItem={(msg) => (
                        <div
                            key={msg.id}
                            className="text-black dark:text-white"
                        >
                            <span className="font-medium text-[#214478] dark:text-[#214478]">
                                {msg.sender.name}
                            </span>
                            : {msg.preview}
                        </div>
                    )}
                />

                {/* Nuevos seguidores */}
                <AlertSection
                    title="Nuevos seguidores"
                    items={recentFollowers}
                    emptyMessage="No tienes nuevos seguidores."
                    renderItem={(follower) => (
                        <div
                            key={follower.id}
                            className="text-black dark:text-white"
                        >
                            <span className="font-medium text-[#214478] dark:text-[#214478]">
                                {follower.name}
                            </span>{" "}
                            empezó a seguirte.
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

function AlertSection({ title, items, emptyMessage, renderItem }) {
    return (
        <section className="bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <h2 className="text-xl font-semibold text-[#214478] dark:text-[#214478] mb-4">
                {title}
            </h2>
            {items.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                    {emptyMessage}
                </p>
            ) : (
                <ul className="space-y-3">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="text-black dark:text-white"
                        >
                            {renderItem(item)}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

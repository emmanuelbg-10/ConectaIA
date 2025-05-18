import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";

export default function Alerts({ friendRequests, recentMessages, recentFollowers }) {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <Head title="Alertas" />
            <h1 className="text-2xl font-bold mb-6">Alertas</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Peticiones de amistad</h2>
                {friendRequests.length === 0 ? (
                    <p className="text-gray-500">No tienes nuevas peticiones.</p>
                ) : (
                    <ul>
                        {friendRequests.map((req) => (
                            <li key={req.id} className="mb-2">
                                <span className="font-medium">{req.sender.name}</span> te ha enviado una petición.
                                {/* Aquí puedes poner botones para aceptar/rechazar */}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Mensajes recientes</h2>
                {recentMessages.length === 0 ? (
                    <p className="text-gray-500">No tienes mensajes nuevos.</p>
                ) : (
                    <ul>
                        {recentMessages.map((msg) => (
                            <li key={msg.id} className="mb-2">
                                <span className="font-medium">{msg.sender.name}</span>: {msg.preview}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Nuevos seguidores</h2>
                {recentFollowers.length === 0 ? (
                    <p className="text-gray-500">No tienes nuevos seguidores.</p>
                ) : (
                    <ul>
                        {recentFollowers.map((follower) => (
                            <li key={follower.id} className="mb-2">
                                <span className="font-medium">{follower.name}</span> empezó a seguirte.
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
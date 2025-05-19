import React from "react";

export default function ModalAlerts({ open, onClose, friendRequests, recentMessages, recentFollowers }) {
    if (!open) return null;

    // Función para aceptar petición
    const handleAccept = async (id) => {
        await fetch(`/friendships/accept/${id}`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
            },
        });
        // Opcional: recargar alertas o eliminar la petición aceptada del estado
        window.location.reload();
    };

    // Función para rechazar petición (opcional)
    const handleReject = async (id) => {
        await fetch(`/friendships/reject/${id}`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
            },
        });
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Alertas</h2>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Peticiones de amistad</h3>
                    {friendRequests.length === 0 ? (
                        <p className="text-gray-500">No tienes nuevas peticiones.</p>
                    ) : (
                        <ul>
                            {friendRequests.map((req) => (
                                <li key={req.id} className="mb-2 flex items-center justify-between">
                                    <span>
                                        <span className="font-medium">{req.sender.name}</span> te ha enviado una petición.
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Mensajes recientes</h3>
                    {recentMessages.length === 0 ? (
                        <p className="text-gray-500">No tienes mensajes nuevos.</p>
                    ) : (
                        <ul>
                            {recentMessages.map((msg) => (
                                <li key={msg.id} className="mb-2">
                                    <span className="font-medium">{msg.sender.name}</span>: {msg.content}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Nuevos seguidores</h3>
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
                </div>
            </div>
        </div>
    );
}
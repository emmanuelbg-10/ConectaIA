import React, { useEffect, useRef } from "react";
import { FaUserPlus, FaEnvelope, FaUserFriends, FaTimes } from "react-icons/fa";

export default function ModalAlerts({
    open,
    onClose,
    friendRequests = [],
    recentMessages = [],
    recentFollowers = [],
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (!open) return null;

    const handleAccept = async (id) => {
        await fetch(`/friendships/accept/${id}`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]'
                ).content,
            },
        });
        window.location.reload();
    };

    const handleReject = async (id) => {
        await fetch(`/friendships/reject/${id}`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]'
                ).content,
            },
        });
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 ">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-6 text-black dark:text-white relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
                    aria-label="Cerrar"
                >
                    <FaTimes />
                </button>

                <h2 className="text-3xl font-bold mb-6 text-center text-[#214478] title dark:text-blue-800">
                    Alertas
                </h2>

                <Section title="Peticiones de amistad" icon={<FaUserFriends />}>
                    {friendRequests.length === 0 ? (
                        <EmptyState text="No tienes nuevas peticiones." />
                    ) : (
                        <ul className="space-y-3">
                            {friendRequests.map((req) => (
                                <li
                                    key={req.id}
                                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 flex justify-between items-center"
                                >
                                    <div>
                                        <span className="font-bold text-[#214478] dark:text-blue-600">
                                            {req.sender.name}
                                        </span>{" "}
                                        te ha enviado una petición.
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <Section title="Mensajes recientes" icon={<FaEnvelope />}>
                    {recentMessages.length === 0 ? (
                        <EmptyState text="No tienes mensajes nuevos." />
                    ) : (
                        <ul className="space-y-2">
                            {recentMessages.map((msg) => (
                                <li
                                    key={msg.id}
                                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2"
                                >
                                    <span className="font-bold text-[#214478] dark:text-blue-600">
                                        {msg.sender.name}
                                    </span>
                                    : {msg.content}
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <Section title="Nuevos seguidores" icon={<FaUserPlus />}>
                    {recentFollowers.length === 0 ? (
                        <EmptyState text="No tienes nuevos seguidores." />
                    ) : (
                        <ul className="space-y-2">
                            {recentFollowers.map((follower) => (
                                <li
                                    key={follower.id}
                                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2"
                                >
                                    <span className="font-bold text-[#214478] dark:text-blue-600">
                                        {follower.name}
                                    </span>{" "}
                                    empezó a seguirte.
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>
            </div>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-[#214478]">
                {icon} {title}
            </h3>
            {children}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-md">
            {text}
        </p>
    );
}

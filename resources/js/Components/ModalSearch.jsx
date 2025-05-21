import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaUser, FaClipboard, FaTimes } from "react-icons/fa";
import FriendButton from "@/Components/FriendButton";
import FollowButton from "@/Components/FollowButton";

export default function ModalSearch({
    open,
    onClose,
    authUser,
    onPublicationSelect = () => {},
}) {
    const [query, setQuery] = useState("");
    const [type, setType] = useState("users"); // "users" o "publications"
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

    const handleClose = () => onClose();

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        setLoading(true);
        const timeout = setTimeout(() => {
            fetch(`/search?type=${type}&q=${encodeURIComponent(query)}`)
                .then((res) => res.json())
                .then((data) => setResults(data))
                .finally(() => setLoading(false));
        }, 400);
        return () => clearTimeout(timeout);
    }, [query, type]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative text-gray-800 dark:text-gray-100"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
                    aria-label="Cerrar"
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <FaSearch className="text-2xl text-[#214478] dark:text-blue-600" />
                    <h2 className="text-2xl font-bold text-[#214478] dark:text-blue-600 title">
                        Buscar {type === "users" ? "Usuarios" : "Publicaciones"}
                    </h2>
                </div>

                {/* Search Input and Type Selector */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:text-black dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#214478] dark:focus:ring-blue-600"
                        placeholder={`Escribe para buscar ${
                            type === "users" ? "usuarios" : "publicaciones"
                        }...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:text-black dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#214478] dark:focus:ring-blue-600"
                    >
                        <option value="users">Usuarios</option>
                        <option value="publications">Publicaciones</option>
                    </select>
                </div>

                {loading && <div className="text-center py-4">Buscando...</div>}

                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {type === "users" &&
                        results.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    {user.avatarURL ? (
                                        <img
                                            src={user.avatarURL}
                                            alt={user.name}
                                            className="h-10 w-10 rounded-full border-2 border-[#214478] dark:border-blue-600"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-semibold text-gray-700 dark:text-gray-300 border-2 border-[#214478] dark:border-blue-600">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-medium">
                                        {user.name}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <FriendButton
                                        userId={user.id}
                                        initialStatus={user.friend_status}
                                    />
                                    <FollowButton
                                        userId={user.id}
                                        initialFollowing={user.following}
                                    />
                                </div>
                            </div>
                        ))}

                    {type === "publications" &&
                        results.map((pub) => (
                            <div
                                key={pub.id}
                                className="cursor-pointer p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => {
                                    window.location.href = `/publications/${pub.id}`;
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <FaClipboard className="text-xl text-[#214478] dark:text-blue-600" />
                                    <span className="font-semibold">
                                        {pub.user ? (
                                            pub.user.name
                                        ) : (
                                            <span className="italic text-gray-400">
                                                Sin usuario
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {pub.textContent}
                                </p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

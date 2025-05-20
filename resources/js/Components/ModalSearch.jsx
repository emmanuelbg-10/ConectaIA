import React, { useState, useEffect, useRef } from "react";
import FriendButton from "@/Components/FriendButton";
import FollowButton from "@/Components/FollowButton";

export default function ModalSearch({ open, onClose, authUser }) {
    const [query, setQuery] = useState("");
    const [type, setType] = useState("users"); // "users" o "publications"
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

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
        }, 400); // debounce

        return () => clearTimeout(timeout);
    }, [query, type]);

    // Cierra el modal al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleClose = () => {
        onClose();
        window.location.reload();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg relative"
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    onClick={handleClose}
                >
                    ×
                </button>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        className="flex-1 px-3 py-2 rounded border"
                        placeholder={`Buscar ${type === "users" ? "usuarios" : "publicaciones"}...`}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="px-2 py-2 rounded border"
                    >
                        <option value="users">Usuarios</option>
                        <option value="publications">Publicaciones</option>
                    </select>
                </div>
                {loading && <div className="text-center">Buscando...</div>}
                <div>
                    {type === "users" && results.map(user => (
                        <div key={user.id} className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                                <img src={user.avatarURL} alt={user.name} className="h-8 w-8 rounded-full" />
                                <span>{user.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <FriendButton userId={user.id} initialStatus={user.friend_status} />
                                <FollowButton userId={user.id} initialFollowing={user.following} />
                            </div>
                        </div>
                    ))}
                    {type === "publications" && results.map(pub => (
                        <div key={pub.id} className="py-2 border-b">
                            <div className="font-semibold">{pub.user.name}</div>
                            <div>{pub.textContent}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
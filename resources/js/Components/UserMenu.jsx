import React, { useState, useRef, useEffect } from "react";
import FriendButton from "@/Components/FriendButton";
import FollowButton from "@/Components/FollowButton";
import Swal from "sweetalert2";

export default function UserMenu({
    userId,
    publicationId,
    isOwner,
    isAdmin,
    friendStatus,
    following,
    onToggleFollow,
    onDeletePublication,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            title: "¿Eliminar publicación?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`/publications/${publicationId}`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "application/json",
                    },
                });
                if (res.ok) {
                    Swal.fire("Eliminada", "La publicación fue eliminada.", "success");
                    if (onDeletePublication) onDeletePublication(publicationId);
                } else {
                    Swal.fire("Error", "No se pudo eliminar la publicación.", "error");
                }
            } catch {
                Swal.fire("Error", "No se pudo eliminar la publicación.", "error");
            }
        }
    };

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setOpen((v) => !v)}
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="4" cy="10" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="16" cy="10" r="2" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2">
                    {/* Solo muestra amistad y seguir si NO eres el dueño */}
                    {!isOwner && (
                        <>
                            <FriendButton userId={userId} initialStatus={friendStatus} />
                            <div className="mt-2">
                                <FollowButton userId={userId} initialFollowing={following} onToggleFollow={onToggleFollow} />
                            </div>
                        </>
                    )}
                    {/* Mostrar botón de eliminar si eres dueño, admin o moderador */}
                    {(isOwner || isAdmin) && (
                        <button
                            className="w-full mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            Eliminar publicación
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
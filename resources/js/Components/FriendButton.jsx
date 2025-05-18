import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function FriendButton({ userId, initialStatus, onFriendStatusChange }) {
    const [status, setStatus] = useState(initialStatus); // 'none', 'pending', 'accepted'

    // Sincroniza el estado local si cambia la prop initialStatus
    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    const sendRequest = async () => {
        try {
            const res = await fetch(`/friendships/send/${userId}`, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    "Accept": "application/json",
                },
            });
            if (res.ok) {
                setStatus("pending");
                if (onFriendStatusChange) onFriendStatusChange("pending");
                Swal.fire("Solicitud enviada", "Tu solicitud de amistad ha sido enviada.", "success");
            } else {
                const data = await res.json();
                Swal.fire("Error", data.message || "No se pudo enviar la solicitud.", "error");
            }
        } catch {
            Swal.fire("Error", "No se pudo enviar la solicitud.", "error");
        }
    };

    const removeFriend = async () => {
        try {
            const res = await fetch(`/friendships/remove/${userId}`, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    "Accept": "application/json",
                },
            });
            if (res.ok) {
                setStatus("none");
                if (onFriendStatusChange) onFriendStatusChange("none");
                Swal.fire("Eliminado", "Ya no son amigos.", "success");
            } else {
                const data = await res.json();
                Swal.fire("Error", data.message || "No se pudo eliminar la amistad.", "error");
            }
        } catch {
            Swal.fire("Error", "No se pudo eliminar la amistad.", "error");
        }
    };

    if (status === "accepted") {
        return (
            <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={removeFriend}
            >
                Eliminar amigo
            </button>
        );
    }
    if (status === "pending") {
        return <button className="px-3 py-1 bg-yellow-400 text-white rounded" disabled>Pendiente</button>;
    }
    return (
        <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={sendRequest}
        >
            Agregar amigo
        </button>
    );
}
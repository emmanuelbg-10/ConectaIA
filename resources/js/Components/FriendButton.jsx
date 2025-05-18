import React, { useState } from "react";
import Swal from "sweetalert2";

export default function FriendButton({ userId, initialStatus }) {
    const [status, setStatus] = useState(initialStatus); // 'none', 'pending', 'accepted'

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
                Swal.fire("Solicitud enviada", "Tu solicitud de amistad ha sido enviada.", "success");
            } else {
                const data = await res.json();
                Swal.fire("Error", data.message || "No se pudo enviar la solicitud.", "error");
            }
        } catch {
            Swal.fire("Error", "No se pudo enviar la solicitud.", "error");
        }
    };

    if (status === "accepted") {
        return <button className="px-3 py-1 bg-green-500 text-white rounded" disabled>Amigos</button>;
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
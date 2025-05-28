import React, { useState } from "react";
import Swal from "sweetalert2";

export default function FollowButton({
    userId,
    initialFollowing,
    onToggleFollow,
}) {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/follow/${userId}`, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                    Accept: "application/json",
                },
            });
            const data = await res.json();
            setFollowing(data.following);
            if (onToggleFollow) {
                onToggleFollow(userId, data.following);
            }
            Swal.fire(
                data.following
                    ? "¡Ahora sigues a este usuario!"
                    : "Has dejado de seguir a este usuario.",
                "",
                "success"
            );
        } catch {
            Swal.fire(
                "Error",
                "No se pudo actualizar el seguimiento.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`px-3 py-1 rounded ${
                following ? "bg-gray-400 text-white" : "bg-blue-500 text-white"
            }`}
            onClick={handleFollow}
            disabled={loading}
        >
            {loading ? "Cargando..." : following ? "Siguiendo" : "Seguir"}
        </button>
    );
}

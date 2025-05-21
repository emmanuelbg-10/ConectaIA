import React from "react";
import Swal from "sweetalert2";

export default function PublicationActions({ publication, onLike }) {
    const handleShare = () => {
        const url = `${window.location.origin}/publications/${publication.id}`;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(url)
                .then(() => {
                    Swal.fire("¡Enlace copiado!", "El enlace de la publicación se ha copiado al portapapeles.", "success");
                })
                .catch(() => {
                    Swal.fire("Error", "No se pudo copiar el enlace al portapapeles.", "error");
                });
        } else {
            const tempInput = document.createElement("input");
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand("copy");
                Swal.fire("¡Enlace copiado!", "El enlace de la publicación se ha copiado al portapapeles.", "success");
            } catch {
                Swal.fire("Error", "No se pudo copiar el enlace al portapapeles.", "error");
            }
            document.body.removeChild(tempInput);
        }
    };

    return (
        <div className="mt-3 flex justify-between max-w-md">
            <button
                className={`flex items-center space-x-1 ${publication.likedByMe ? "text-red-500" : "text-gray-500 dark:text-gray-300"} hover:text-red-500 dark:hover:text-red-400 group`}
                onClick={() => onLike(publication.id)}
            >
                <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900">
                    {publication.likedByMe ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                </div>
                <span className="text-sm">{publication.likesCount}</span>
            </button>
            <button
                type="button"
                className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 group"
                onClick={handleShare}
            >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </div>
            </button>
        </div>
    );
}
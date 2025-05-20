import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiXCircle } from "react-icons/fi";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

const AvatarUploader = ({ user }) => {
    const [avatarPreview, setAvatarPreview] = useState(user.avatarURL);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setAvatarPreview(user.avatarURL);
    }, [user.avatarURL]);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            router.post(route("profile.updateAvatar"), formData, {
                forceFormData: true,
                onSuccess: (page) => {
                    setIsUploading(false);
                    Swal.fire({
                        title: "¡Éxito!",
                        text: "Foto de perfil actualizada correctamente.",
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                },
                onError: (errors) => {
                    console.error("Error al subir el avatar:", errors);
                    setIsUploading(false);
                    Swal.fire({
                        title: "Error",
                        text: "Error al subir la imagen. Inténtalo de nuevo.",
                        icon: "error",
                        confirmButtonText: "Ok",
                    });
                },
            });
        } catch (error) {
            console.error("Error en la petición:", error);
            setIsUploading(false);
            Swal.fire({
                title: "Error de conexión",
                text: "Hubo un problema al conectar con el servidor.",
                icon: "error",
                confirmButtonText: "Ok",
            });
        }
    };

    const handleDeleteAvatar = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminarla",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("profile.deleteAvatar"), {
                    onSuccess: () => {
                        setAvatarPreview(null);
                        Swal.fire(
                            "¡Eliminada!",
                            "Tu foto de perfil ha sido eliminada.",
                            "success"
                        );
                    },
                    onError: (errors) => {
                        console.error("Error al eliminar el avatar:", errors);
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar la foto de perfil.",
                            "error"
                        );
                    },
                });
            }
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".png", ".jpg", ".gif", ".webp"],
        },
        maxFiles: 1,
    });

    return (
        <div className="relative w-32 h-32 mx-auto mt-12">
            {!user.avatarURL && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 w-48 h-32 pointer-events-none select-none">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                        <path
                            id="curved-text-path"
                            d="M 20 90 A 80 80 0 0 1 180 90"
                            fill="transparent"
                        />
                        <text
                            className="text-sm font-semibold fill-gray-700 dark:fill-gray-300"
                            textAnchor="middle"
                        >
                            <textPath
                                href="#curved-text-path"
                                startOffset="50%"
                                alignmentBaseline="middle"
                            >
                                Añade una foto de perfil
                            </textPath>
                        </text>
                    </svg>
                </div>
            )}
            <div
                {...getRootProps()}
                className={`relative w-32 h-32 rounded-full border-4 border-[#214478] object-cover cursor-pointer flex items-center justify-center ${
                    isDragActive ? "border-dashed border-blue-500" : ""
                } ${isUploading ? "animate-pulse" : ""}`}
            >
                <input {...getInputProps()} />
                {avatarPreview && avatarPreview.trim() !== "" ? (
                    <>
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                        />
                        {user.avatarURL && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAvatar();
                                }}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
                                aria-label="Eliminar foto de perfil"
                            >
                                <FiXCircle className="w-5 h-5" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-5xl font-bold text-gray-700 dark:text-gray-300">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                {isDragActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white text-lg">
                        Suelta la imagen aquí
                    </div>
                )}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white text-sm">
                        Subiendo...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarUploader;

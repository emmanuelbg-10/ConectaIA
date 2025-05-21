import React, { useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    FiMessageSquare,
    FiEdit,
    FiTrash2,
    FiArrowLeft,
    FiSave,
    FiX,
    FiSend,
} from "react-icons/fi";
import PublicationActions from "@/Components/PublicationActions";

const csrf = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrf ? csrf.getAttribute("content") : "";

function ResponseItem({
    response,
    onReplyClick,
    replyingTo,
    replyText,
    setReplyText,
    handleReplySubmit,
    processing,
    authUser,
    onEditClick,
    editingId,
    editText,
    setEditText,
    handleEditSubmit,
    handleDelete,
}) {
    const isOwn = authUser && response.user.id === authUser.id;
    const isReplying = replyingTo === response.id && editingId !== response.id;
    const isEditing = editingId === response.id;
    const replyTextAreaRef = useRef(null);
    const editTextAreaRef = useRef(null);
    const responseItemRef = useRef(null);
    const transitionDuration = 300;
    const [isReplyFocused, setIsReplyFocused] = useState(false);

    useEffect(() => {
        if (isReplying && replyTextAreaRef.current && !isReplyFocused) {
            replyTextAreaRef.current.focus();
        }
        if (isEditing && editTextAreaRef.current) {
            editTextAreaRef.current.focus();
        }
        if (!isReplying && replyTextAreaRef.current && isReplyFocused) {
            replyTextAreaRef.current.blur();
            setIsReplyFocused(false);
        }

        const handleClickOutside = (event) => {
            if (
                responseItemRef.current &&
                !responseItemRef.current.contains(event.target) &&
                isEditing &&
                !event.target.closest("button")
            ) {
                onEditClick(0, "");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isReplying, isEditing, onEditClick, isReplyFocused]);

    const handleTransition = (callback, delay = transitionDuration) => {
        setTimeout(callback, delay);
    };

    const handleReplyKeyDown = (e, parentId) => {
        if (e.key === "Enter" && !e.shiftKey && replyText.trim()) {
            e.preventDefault();
            handleReplySubmit(e, parentId);
        }
    };

    const handleEditKeyDown = (e, id) => {
        if (e.key === "Enter" && !e.shiftKey && editText.trim()) {
            e.preventDefault();
            handleEditSubmit(e, id);
        }
    };

    console.log(response.user);

    return (
        <div
            className="py-3 px-4 border-b border-gray-200 dark:border-gray-700"
            ref={responseItemRef}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {response.user.avatarURL ? (
                        <img
                            src={response.user.avatarURL}
                            alt={response.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300">
                            {response.user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {response.user.name}
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                onClick={() => {
                                    if (isEditing) {
                                        onEditClick(0, "");
                                        handleTransition(() =>
                                            onReplyClick(response.id)
                                        );
                                    } else {
                                        onReplyClick(response.id);
                                    }
                                }}
                                type="button"
                                aria-label="Responder"
                            >
                                <FiMessageSquare className="h-5 w-5" />
                            </button>
                            {isOwn && (
                                <>
                                    <button
                                        className="text-yellow-600 hover:text-yellow-800 focus:outline-none"
                                        onClick={() => {
                                            if (isReplying) {
                                                onReplyClick(0);
                                                handleTransition(() =>
                                                    onEditClick(
                                                        response.id,
                                                        response.text
                                                    )
                                                );
                                            } else {
                                                onEditClick(
                                                    response.id,
                                                    response.text
                                                );
                                            }
                                        }}
                                        type="button"
                                        aria-label="Editar"
                                    >
                                        <FiEdit className="h-5 w-5" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 focus:outline-none"
                                        onClick={() => {
                                            if (isEditing) onEditClick(0, "");
                                            handleDelete(response.id);
                                        }}
                                        type="button"
                                        aria-label="Borrar"
                                    >
                                        <FiTrash2 className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {response.text}
                    </p>

                    {/* Contenedor de formularios con transiciones */}
                    <div className="mt-3 space-y-3">
                        {/* Formulario de edición */}
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isEditing
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            {isEditing && (
                                <form
                                    onSubmit={(e) =>
                                        handleEditSubmit(e, response.id)
                                    }
                                >
                                    <textarea
                                        ref={editTextAreaRef}
                                        value={editText}
                                        onChange={(e) =>
                                            setEditText(e.target.value)
                                        }
                                        className="w-full border rounded p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
                                        rows={3}
                                        onKeyDown={(e) =>
                                            handleEditKeyDown(e, response.id)
                                        }
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="submit"
                                            disabled={
                                                processing || !editText.trim()
                                            }
                                            className="px-3 py-1 bg-[#214478] text-white rounded text-sm focus:outline-none hover:opacity-80 flex items-center"
                                        >
                                            <FiSave className="mr-1" /> Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEditClick(0, "")}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm focus:outline-none hover:opacity-80 dark:bg-gray-700 dark:text-gray-300 flex items-center"
                                        >
                                            <FiX className="mr-1" /> Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Formulario de respuesta */}
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isReplying
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            {isReplying && (
                                <form
                                    onSubmit={(e) =>
                                        handleReplySubmit(e, response.id)
                                    }
                                >
                                    <textarea
                                        ref={replyTextAreaRef}
                                        value={replyText}
                                        onChange={(e) =>
                                            setReplyText(e.target.value)
                                        }
                                        className="w-full border rounded p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
                                        placeholder="Escribe una respuesta..."
                                        rows={3}
                                        onKeyDown={(e) =>
                                            handleReplyKeyDown(e, response.id)
                                        }
                                        onFocus={() => setIsReplyFocused(true)}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="submit"
                                            disabled={
                                                processing || !replyText.trim()
                                            }
                                            className="px-3 py-1 bg-[#214478] text-white rounded text-sm focus:outline-none hover:opacity-80 flex items-center"
                                        >
                                            {processing ? (
                                                "Enviando..."
                                            ) : (
                                                <>
                                                    <FiSend className="mr-1" />{" "}
                                                    Responder
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onReplyClick(0)}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm focus:outline-none hover:opacity-80 dark:bg-gray-700 dark:text-gray-300 flex items-center"
                                        >
                                            <FiX className="mr-1" /> Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Respuestas hijas */}
                    {response.children && response.children.length > 0 && (
                        <div className="pl-6 mt-3 border-l border-gray-200 dark:border-gray-700">
                            {response.children.map((child) => (
                                <ResponseItem
                                    key={child.id}
                                    response={child}
                                    onReplyClick={onReplyClick}
                                    replyingTo={replyingTo}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                    handleReplySubmit={handleReplySubmit}
                                    processing={processing}
                                    authUser={authUser}
                                    onEditClick={onEditClick}
                                    editingId={editingId}
                                    editText={editText}
                                    setEditText={setEditText}
                                    handleEditSubmit={handleEditSubmit}
                                    handleDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Show({ publication: initialPublication, authUser }) {
    // Para responder a la publicación principal
    const [pubText, setPubText] = useState("");
    const [processing, setProcessing] = useState(false);
    const pubTextAreaRef = useRef(null);

    // Para responder a una respuesta específica
    const [replyingTo, setReplyingTo] = useState(0);
    const [replyText, setReplyText] = useState("");

    // Para editar una respuesta
    const [editingId, setEditingId] = useState(0);
    const [editText, setEditText] = useState("");

    // Estado para paginación de respuestas
    const [visibleCount, setVisibleCount] = useState(10);

    // Estado para la publicación (para manejar el "me gusta")
    const [publication, setPublication] = useState(initialPublication);

    useEffect(() => {
        if (pubTextAreaRef.current) {
            pubTextAreaRef.current.focus();
        }
    }, []);

    const onEditClick = (id, text) => {
        setEditingId(id);
        setEditText(text);
        setReplyingTo(0);
    };

    const handlePubKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && pubText.trim()) {
            e.preventDefault();
            handlePubSubmit(e);
        }
    };

    // Responder a la publicación principal
    const handlePubSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        Swal.fire({
            title: "Validando contenido...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const geminiRes = await fetch("/moderate-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ text: pubText }),
            });
            const geminiData = await geminiRes.json();
            if (!geminiData.allowed) {
                Swal.fire(
                    "Contenido bloqueado",
                    geminiData.message ||
                        "Tu respuesta contiene contenido ofensivo.",
                    "warning"
                );
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire(
                "Error",
                "No se pudo validar el contenido. Intenta de nuevo.",
                "error"
            );
            setProcessing(false);
            return;
        }

        Swal.close();

        Inertia.post(
            route("responses.store", { publication: publication.id }),
            { text: pubText, parent_id: 0 },
            {
                onSuccess: () => {
                    setPubText("");
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            }
        );
    };

    // Responder a una respuesta
    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        setProcessing(true);

        Swal.fire({
            title: "Validando contenido...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const geminiRes = await fetch("/moderate-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ text: replyText }),
            });
            const geminiData = await geminiRes.json();
            if (!geminiData.allowed) {
                Swal.fire(
                    "Contenido bloqueado",
                    geminiData.message ||
                        "Tu respuesta contiene contenido ofensivo.",
                    "warning"
                );
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire(
                "Error",
                "No se pudo validar el contenido. Intenta de nuevo.",
                "error"
            );
            setProcessing(false);
            return;
        }

        Swal.close();

        Inertia.post(
            route("responses.store", { publication: publication.id }),
            {
                text: replyText,
                parent_id: parentId,
            },
            {
                onSuccess: () => {
                    setReplyText("");
                    setReplyingTo(0);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            }
        );
    };

    // Editar una respuesta
    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        setProcessing(true);

        Swal.fire({
            title: "Validando contenido...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const geminiRes = await fetch("/moderate-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ text: editText }),
            });
            const geminiData = await geminiRes.json();
            if (!geminiData.allowed) {
                Swal.fire(
                    "Contenido bloqueado",
                    geminiData.message ||
                        "Tu respuesta contiene contenido ofensivo.",
                    "warning"
                );
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire(
                "Error",
                "No se pudo validar el contenido. Intenta de nuevo.",
                "error"
            );
            setProcessing(false);
            return;
        }

        Swal.close();

        Inertia.put(
            route("responses.update", { response: id }),
            { text: editText },
            {
                onSuccess: () => {
                    setEditingId(0);
                    setEditText("");
                    setProcessing(false);
                    setReplyingTo(0);
                },
                onError: () => setProcessing(false),
            }
        );
    };

    // Eliminar una respuesta
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esto.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                Inertia.delete(route("responses.destroy", { response: id }), {
                    onSuccess: () => {
                        setProcessing(false);
                        Swal.fire(
                            "Borrado!",
                            "La respuesta ha sido borrada.",
                            "success"
                        );
                    },
                    onError: () => {
                        setProcessing(false);
                        Swal.fire(
                            "Error",
                            "No se pudo borrar la respuesta.",
                            "error"
                        );
                    },
                });
            }
        });
    };

    // Ordena y recorta las respuestas principales (las más nuevas primero)
    const sortedResponses = [...(publication.responses || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, visibleCount);

    // Renderiza solo las respuestas visibles
    const renderResponses = (responses) =>
        responses.map((resp) => (
            <ResponseItem
                key={resp.id}
                response={resp}
                onReplyClick={setReplyingTo}
                replyingTo={replyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
                processing={processing}
                authUser={authUser}
                onEditClick={onEditClick}
                editingId={editingId}
                editText={editText}
                setEditText={setEditText}
                handleEditSubmit={handleEditSubmit}
                handleDelete={handleDelete}
            />
        ));

    // Saber si hay más respuestas para mostrar
    const hasMore = (publication.responses || []).length > visibleCount;

    const handleLike = async (publicationId) => {
        try {
            const res = await fetch(`/publications/${publicationId}/like`, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });
            if (res.status === 419) {
                window.location.reload();
                return;
            }
            const data = await res.json();
            // Actualiza el estado de la publicación (si usas useState)
            setPublication((prev) => ({
                ...prev,
                likedByMe: data.liked,
                likesCount: data.count,
            }));
        } catch (e) {
            console.log(e);
            
            Swal.fire("Error", "No se pudo actualizar el Me gusta.", "error");
        }
    };

    return (
        <AuthenticatedLayout
            user={authUser}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Publicación
                </h2>
            }
        >
            <Head title="Publicación" />
            <div className="max-w-3xl mx-auto p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {publication.user.avatarURL ? (
                                <img
                                    src={publication.user.avatarURL}
                                    alt={publication.user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300">
                                    {publication.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                {publication.user.name}
                            </h2>
                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {publication.textContent}
                            </p>
                            {publication.imageURL && (
                                <img
                                    src={publication.imageURL}
                                    alt=""
                                    className="mt-4 rounded-md max-h-96 w-full object-cover"
                                />
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Publicado el{" "}
                                {new Date(publication.created_at).toLocaleDateString()}
                            </p>
                            {/* Aquí van los botones de like y compartir */}
                            <PublicationActions publication={publication} onLike={handleLike} />
                        </div>
                    </div>
                </div>

                {/* Formulario para responder a la publicación */}
                <form
                    onSubmit={handlePubSubmit}
                    className="mb-6 flex items-center space-x-2"
                >
                    <textarea
                        ref={pubTextAreaRef}
                        value={pubText}
                        onChange={(e) => setPubText(e.target.value)}
                        className="w-full border rounded p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-[#214478] focus:border-[#214478]"
                        placeholder="Escribe una respuesta..."
                        rows={3}
                        onKeyDown={handlePubKeyDown}
                    />
                    <button
                        type="submit"
                        disabled={processing || !pubText.trim()}
                        className="px-4 py-2 bg-[#214478] text-white rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#214478] focus-ring-offset-2 flex items-center"
                    >
                        {processing ? (
                            "Enviando..."
                        ) : (
                            <>
                                <FiSend className="mr-1" /> Responder
                            </>
                        )}
                    </button>
                    <Link
                        href={route("publications.index")}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:opacity-80 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus-ring-offset-2 flex items-center"
                    >
                        <FiArrowLeft className="h-5 w-5 inline-block align-middle mr-1" />
                        Volver
                    </Link>
                </form>

                <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                        Respuestas
                    </h3>
                    {sortedResponses.length > 0 ? (
                        renderResponses(sortedResponses)
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No hay respuestas aún.
                        </p>
                    )}

                    {/* Botón "Ver más" */}
                    {hasMore && (
                        <button
                            onClick={() => setVisibleCount(visibleCount + 10)}
                            className="block mx-auto mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus-ring-offset-2"
                        >
                            Ver más respuestas
                        </button>
                    )}

                    {/* Botón "Volver al feed" SIEMPRE debajo del último cargado */}
                    {!hasMore && (
                        <Link
                            href={route("publications.index")}
                            className=" mt-6 text-[#214478] hover:underline focus:outline-none focus:ring-2 focus:ring-[#214478] focus-ring-offset-2 flex items-center"
                        >
                            <FiArrowLeft className="h-5 w-5 inline-block align-middle mr-1" />
                            Volver al feed
                        </Link>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { Inertia } from '@inertiajs/inertia';
import Swal from "sweetalert2";

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
    handleDelete
}) {
    const isOwn = authUser && response.user.id === authUser.id;

    return (
        <div className="border-b py-2 pl-2">
            <div className="flex items-center space-x-2">
                <span className="font-bold">{response.user.name}:</span>
                <span>{response.text}</span>
                <button
                    className="ml-2 text-xs text-blue-500 hover:underline"
                    onClick={() => onReplyClick(response.id)}
                    type="button"
                >
                    Responder
                </button>
                {isOwn && (
                    <>
                        <button
                            className="ml-2 text-xs text-yellow-600 hover:underline"
                            onClick={() => onEditClick(response.id, response.text)}
                            type="button"
                        >
                            Editar
                        </button>
                        <button
                            className="ml-2 text-xs text-red-600 hover:underline"
                            onClick={() => handleDelete(response.id)}
                            type="button"
                        >
                            Borrar
                        </button>
                    </>
                )}
            </div>
            {/* Formulario para editar */}
            {editingId === response.id && (
                <form
                    onSubmit={e => handleEditSubmit(e, response.id)}
                    className="mt-2"
                >
                    <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full border rounded p-2"
                        rows={2}
                    />
                    <div className="flex gap-2 mt-1">
                        <button
                            type="submit"
                            disabled={processing || !editText.trim()}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => onEditClick(0, "")}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
            {/* Formulario para responder */}
            {replyingTo === response.id && editingId !== response.id && (
                <form
                    onSubmit={e => handleReplySubmit(e, response.id)}
                    className="mt-2"
                >
                    <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Escribe una respuesta..."
                        rows={2}
                    />
                    <div className="flex gap-2 mt-1">
                        <button
                            type="submit"
                            disabled={processing || !replyText.trim()}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                        >
                            {processing ? "Enviando..." : "Responder"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onReplyClick(0)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
            {/* Respuestas hijas */}
            {response.children && response.children.length > 0 && (
                <div className="pl-4 mt-2 border-l border-gray-200">
                    {response.children.map(child => (
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
    );
}

export default function Show({ publication, authUser }) {
    // Para responder a la publicación principal
    const [pubText, setPubText] = useState("");
    const [processing, setProcessing] = useState(false);

    // Para responder a una respuesta específica
    const [replyingTo, setReplyingTo] = useState(0);
    const [replyText, setReplyText] = useState("");

    // Para editar una respuesta
    const [editingId, setEditingId] = useState(0);
    const [editText, setEditText] = useState("");

    // Estado para paginación de respuestas
    const [visibleCount, setVisibleCount] = useState(10);

    const onEditClick = (id, text) => {
        setEditingId(id);
        setEditText(text);
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
                Swal.fire("Contenido bloqueado", geminiData.message || "Tu respuesta contiene contenido ofensivo.", "warning");
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo validar el contenido. Intenta de nuevo.", "error");
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
                Swal.fire("Contenido bloqueado", geminiData.message || "Tu respuesta contiene contenido ofensivo.", "warning");
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo validar el contenido. Intenta de nuevo.", "error");
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
                Swal.fire("Contenido bloqueado", geminiData.message || "Tu respuesta contiene contenido ofensivo.", "warning");
                setProcessing(false);
                return;
            }
        } catch (err) {
            Swal.fire("Error", "No se pudo validar el contenido. Intenta de nuevo.", "error");
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
                },
                onError: () => setProcessing(false),
            }
        );
    };

    // Eliminar una respuesta
    const handleDelete = (id) => {
        if (confirm("¿Seguro que quieres borrar esta respuesta?")) {
            setProcessing(true);
            Inertia.delete(
                route("responses.destroy", { response: id }),
                {
                    onSuccess: () => setProcessing(false),
                    onError: () => setProcessing(false),
                }
            );
        }
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

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Head title="Publicación" />
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
                <h2 className="font-bold text-lg">{publication.user.name}</h2>
                <p className="mt-2">{publication.textContent}</p>
                {publication.imageURL && (
                    <img
                        src={publication.imageURL}
                        alt=""
                        className="mt-4 rounded-xl max-h-80 w-full object-cover"
                    />
                )}
            </div>

            {/* Formulario para responder a la publicación */}
            <form onSubmit={handlePubSubmit} className="mb-6 flex items-center gap-2">
                <textarea
                    value={pubText}
                    onChange={e => setPubText(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Escribe una respuesta..."
                    rows={2}
                />
                <button
                    type="submit"
                    disabled={processing || !pubText.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {processing ? "Enviando..." : "Responder"}
                </button>
                <Link
                    href={route("publications.index")}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    ← Volver al feed
                </Link>
            </form>

            <div>
                <h3 className="font-semibold mb-2">Respuestas</h3>
                {sortedResponses.length > 0 ? (
                    renderResponses(sortedResponses)
                ) : (
                    <p className="text-gray-500">No hay respuestas aún.</p>
                )}

                {/* Botón "Ver más" */}
                {hasMore && (
                    <button
                        onClick={() => setVisibleCount(visibleCount + 10)}
                        className="block mx-auto my-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Ver más respuestas
                    </button>
                )}

                {/* Botón "Volver al feed" SIEMPRE debajo del último cargado */}
                <Link
                    href={route("publications.index")}
                    className="block mt-6 text-blue-500 hover:underline"
                >
                    ← Volver al feed
                </Link>
            </div>
        </div>
    );
}
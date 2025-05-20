import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import Swal from "sweetalert2";
import {
    PaperAirplaneIcon,
    PhotographIcon,
    XIcon,
} from "@heroicons/react/outline";
import UserMenu from "@/Components/UserMenu";
import ModalSearch from "@/Components/ModalSearch";

function getCsrfToken() {
    const csrf = document.querySelector('meta[name="csrf-token"]');
    return csrf ? csrf.getAttribute("content") : "";
}

function normalizePublication(pub) {
    return {
        ...pub,
        likedByMe: pub.likedByMe ?? pub.liked_by_me ?? false,
        likesCount: pub.likesCount ?? pub.likes_count ?? 0,
        friend_status: pub.friend_status ?? "none",
        following: pub.following ?? false,
    };
}

export default function TwitterStyleFeed({
    authUser,
    publications: initialPublications,
    friends,
    followers,
}) {
    const { props: pageProps } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm(
        {
            textContent: "",
            image: null,
            preview: null,
            hashtags: [],
        },
        { resetOnSuccess: false }
    );
    const [showForm, setShowForm] = useState(false);
    const [publications, setPublications] = useState(
        (initialPublications.data || initialPublications).map(
            normalizePublication
        )
    );
    const [nextPageUrl, setNextPageUrl] = useState(
        initialPublications.links?.next || initialPublications.next_page_url
    );
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState("general");
    const [hashtagSearch, setHashtagSearch] = useState("");
    const [hashtagQuery, setHashtagQuery] = useState([]); // ahora es array
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setPublications(
            (initialPublications.data || initialPublications).map(
                normalizePublication
            )
        );
        setNextPageUrl(initialPublications.next_page_url);
    }, [initialPublications]);

    const loadMorePublications = async () => {
        if (!nextPageUrl || loadingMore) return;
        setLoadingMore(true);
        try {
            const response = await fetch(nextPageUrl, {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const result = await response.json();
            setPublications((prev) => [
                ...prev,
                ...result.data.map(normalizePublication),
            ]);
            setNextPageUrl(result.next_page_url);
        } catch (error) {
            Swal.fire(
                "Error",
                "No se pudieron cargar más publicaciones.",
                "error"
            );
        } finally {
            setLoadingMore(false);
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } =
                document.documentElement;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
            if (isNearBottom && nextPageUrl && !loadingMore) {
                loadMorePublications();
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [nextPageUrl, publications, loadingMore]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("image", file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setData("preview", reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();

        Swal.fire({
            title: "Validando contenido...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            console.log("Enviando a moderación...");
            const geminiRes = await fetch("moderate-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: JSON.stringify({ text: data.textContent }),
            });

            let geminiData;
            try {
                geminiData = await geminiRes.json();
            } catch (jsonErr) {
                console.log("Error al parsear respuesta de moderación:", jsonErr);
                Swal.fire(
                    "Error",
                    "Respuesta inesperada del servidor de moderación.",
                    "error"
                );
                setShowForm(false);
                return;
            }

            console.log("Respuesta de moderación:", geminiData);

            if (!geminiRes.ok) {
                Swal.fire(
                    "Error",
                    geminiData.message || "No se pudo validar el contenido.",
                    "error"
                );
                setShowForm(false);
                return;
            }

            if (!geminiData.allowed) {
                Swal.fire(
                    "Contenido bloqueado",
                    geminiData.message ||
                        "Tu publicación contiene contenido ofensivo.",
                    "warning"
                );
                setShowForm(false);
                return;
            }
        } catch (err) {
            console.log("Error en la moderación:", err);
            Swal.fire(
                "Error",
                "No se pudo validar el contenido. Intenta de nuevo.",
                "error"
            );
            setShowForm(false);
            return;
        }

        // Obtener hashtags sugeridos
        console.log("Llamando a sugerencia de hashtags...");
        const hashtagsRes = await fetch("/hashtags/suggest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": getCsrfToken(),
            },
            body: JSON.stringify({ text: data.textContent }),
        });
        
        const hashtagsData = await hashtagsRes.json();
        const suggestedHashtags = hashtagsData.hashtags || [];
        let hashtagsToSend = [];

        if (suggestedHashtags.length > 0) {
            let manualHashtags = [];
            let htmlContent = () => `
                <div style="text-align:left;" id="hashtags-modal-content">
                    ${suggestedHashtags
                        .map(
                            (tag, i) =>
                                `<label style="display:block;">
                                    <input type="checkbox" value="${tag}" id="hashtag_${i}" checked />
                                    #${tag}
                                </label>`
                        )
                        .join("")}
                    <div style="margin-top:10px;">
                        <input type="text" id="manualHashtagInput" placeholder="Añadir hashtag manual" style="width:70%;" maxlength="30"/>
                        <button type="button" id="addManualHashtagBtn" style="margin-left:5px;">Añadir</button>
                    </div>
                    <div id="manualHashtagsList" style="margin-top:5px;"></div>
                    <div id="hashtagError" style="color:red;margin-top:5px;"></div>
                </div>
            `;

            const swalResult = await Swal.fire({
                title: "Selecciona hashtags sugeridos o añade propios",
                html: htmlContent(),
                focusConfirm: false,
                didOpen: () => {
                    const input = document.getElementById("manualHashtagInput");
                    const btn = document.getElementById("addManualHashtagBtn");
                    const list = document.getElementById("manualHashtagsList");
                    const errorDiv = document.getElementById("hashtagError");

                    const renderManualList = () => {
                        list.innerHTML = manualHashtags
                            .map(
                                (tag, idx) =>
                                    `<span style="display:inline-block;background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:12px;margin:2px;">
                                        #${tag}
                                        <button type="button" data-idx="${idx}" style="background:none;border:none;color:#a00;font-weight:bold;cursor:pointer;">&times;</button>
                                    </span>`
                            )
                            .join("");
                        // Botón para eliminar
                        list.querySelectorAll("button[data-idx]").forEach((btn) => {
                            btn.onclick = () => {
                                manualHashtags.splice(Number(btn.dataset.idx), 1);
                                renderManualList();
                            };
                        });
                    };

                    btn.onclick = () => {
                        let val = input.value.trim().replace(/^#/, "");
                        if (!val) return;
                        if (
                            manualHashtags.length + suggestedHashtags.filter((_, i) =>
                                document.getElementById(`hashtag_${i}`).checked
                            ).length >= 5
                        ) {
                            errorDiv.textContent = "Máximo 5 hashtags en total.";
                            return;
                        }
                        if (
                            manualHashtags.includes(val) ||
                            suggestedHashtags.some(
                                (tag, i) =>
                                    tag === val &&
                                    document.getElementById(`hashtag_${i}`).checked
                            )
                        ) {
                            errorDiv.textContent = "Hashtag repetido.";
                            return;
                        }
                        manualHashtags.push(val);
                        input.value = "";
                        errorDiv.textContent = "";
                        renderManualList();
                    };
                },
                preConfirm: () => {
                    const selected = suggestedHashtags.filter((_, i) =>
                        document.getElementById(`hashtag_${i}`).checked
                    );
                    const total = selected.length + manualHashtags.length;
                    if (total > 5) {
                        Swal.showValidationMessage("Máximo 5 hashtags en total.");
                        return false;
                    }
                    return [...selected, ...manualHashtags];
                },
                confirmButtonText: "Usar seleccionados",
                showCancelButton: true,
                cancelButtonText: "Sin hashtags",
            });

            hashtagsToSend = swalResult.isConfirmed ? (swalResult.value || []) : [];
            console.log("Hashtags seleccionados para enviar:", hashtagsToSend);
        }

        Swal.close();

        // Creación optimista
        const optimisticPublication = {
            id: `temp-${Date.now()}`,
            textContent: data.textContent,
            user: authUser,
            created_at: new Date().toISOString(),
            imageURL: data.preview,
            hashtags: hashtagsToSend,
        };

        setPublications((prev) => [
            normalizePublication(optimisticPublication),
            ...prev,
        ]);
        setShowForm(false);

      

        console.log("Enviando publicación al backend...");
        console.log("Payload a enviar:", {
            textContent: data.textContent,
            image: data.image ? "[FILE]" : null,
            hashtags: hashtagsToSend,
        });

     
            Inertia.post(route("publications.store"), {
                textContent: data.textContent,
                image: data.image,
                hashtags: hashtagsToSend,
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    reset();
                    setData("preview", null);
                    setShowForm(false);
                    Swal.fire(
                        "¡Publicado!",
                        "Tu publicación fue enviada correctamente.",
                        "success"
                    );
                },
                onError: () => {
                    setPublications((prev) =>
                        prev.filter((p) => p.id !== optimisticPublication.id)
                    );
                    Swal.fire(
                        "Error",
                        "No se pudo publicar. Intenta de nuevo.",
                        "error"
                    );
                },
            });
      

        return false;
    };

    const handleLike = async (publicationId) => {
        try {
            const res = await fetch(`publications/${publicationId}/like`, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });
            if (res.status === 419) {
                window.location.reload();
                return;
            }
            const data = await res.json();
            setPublications((prev) =>
                prev.map((pub) =>
                    pub.id === publicationId
                        ? {
                              ...pub,
                              likedByMe: data.liked,
                              likesCount: data.count,
                          }
                        : pub
                )
            );
        } catch (e) {
            Swal.fire("Error", "No se pudo actualizar el Me gusta.", "error");
        }
    };

    const formatDate = (dateString) => {
        const options = {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

    const handleHashtagClick = (tag) => {
        setFilter("hashtag");
        const tagText = (tag.hashtag_text || tag).toLowerCase().replace(/^#/, "");
        setHashtagQuery((prev) =>
            prev.includes(tagText) ? prev : [...prev, tagText]
        );
    };

    // Filtrado de publicaciones
    const filteredPublications =
        filter === "general"
            ? publications
            : filter === "following"
            ? publications.filter(
                  (pub) => pub.following || pub.user.id === authUser.id
              )
            : filter === "hashtag" && hashtagQuery.length > 0
            ? publications.filter(
                  (pub) =>
                      pub.hashtags &&
                      hashtagQuery.every((q) =>
                          pub.hashtags.some(
                              (tag) =>
                                  (tag.hashtag_text || tag)
                                      .toLowerCase()
                                      .replace(/^#/, "") === q
                          )
                      )
              )
            : publications;

    return (
        <AuthenticatedLayout
            authUser={authUser}
            friends={friends}
            followers={followers}
            header={
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Inicio
                    </h1>
                </div>
            }
        >
            <Head title="Publicaciones" />

            {/* Filtros para el feed */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    className={`px-6 py-3 rounded-lg font-bold text-lg transition ${
                        filter === "general"
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => setFilter("general")}
                >
                    General
                </button>
                <button
                    className={`px-6 py-3 rounded-lg font-bold text-lg transition ${
                        filter === "following"
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => setFilter("following")}
                >
                    Siguiendo
                </button>
                <button
                    className={`px-6 py-3 rounded-lg font-bold text-lg transition ${
                        filter === "hashtag"
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => setFilter("hashtag")}
                >
                    Buscar hashtag
                </button>
                {filter === "hashtag" && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            const tag = hashtagSearch.trim().replace(/^#/, "");
                            if (tag && !hashtagQuery.includes(tag.toLowerCase())) {
                                setHashtagQuery([...hashtagQuery, tag.toLowerCase()]);
                            }
                            setHashtagSearch("");
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={hashtagSearch}
                            onChange={e => setHashtagSearch(e.target.value)}
                            placeholder="Ej: futbol"
                            className="px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
                            style={{ minWidth: 120 }}
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 rounded bg-blue-500 text-white font-bold"
                        >
                            Añadir hashtag
                        </button>
                    </form>
                )}
            </div>

            {/* Área para crear nueva publicación */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <button
                            onClick={() => setShowForm(true)}
                            className="block w-full p-3 text-left rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition"
                        >
                            ¿Qué está pasando?
                        </button>
                    </div>
                </div>
            </div>

            {/* Formulario flotante para crear publicación */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    reset();
                                    setData("preview", null);
                                }}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <XIcon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="flex space-x-3">
                                {authUser.avatarURL ? (
                                    <img
                                        src={authUser.avatarURL}
                                        alt={authUser.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        {authUser.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <textarea
                                        value={data.textContent}
                                        onChange={(e) =>
                                            setData(
                                                "textContent",
                                                e.target.value
                                            )
                                        }
                                        placeholder="¿Qué está pasando?"
                                        className="w-full border-none focus:ring-0 text-lg placeholder-gray-500 dark:placeholder-gray-400 tracking-wide min-h-[50px] resize-none bg-transparent text-gray-900 dark:text-gray-100"
                                        autoFocus
                                    />

                                    {data.preview && (
                                        <div className="mt-2 relative">
                                            <img
                                                src={data.preview}
                                                alt="Previsualización"
                                                className="rounded-xl w-full h-auto object-contain max-h-96 block"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData("image", null);
                                                    setData("preview", null);
                                                }}
                                                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                                            >
                                                <XIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <label className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-500 cursor-pointer">
                                            <PhotographIcon className="h-6 w-6" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                !data.textContent.trim()
                                            }
                                            className={`px-4 py-2 rounded-full font-bold ${
                                                !data.textContent.trim() ||
                                                processing
                                                    ? "bg-blue-300 cursor-not-allowed"
                                                    : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            } text-white transition`}
                                        >
                                            {processing
                                                ? "Publicando..."
                                                : "Publicar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
              {filter === "hashtag" && hashtagQuery.length > 0 && (
    <div className="flex gap-2 mt-2 flex-wrap">
        {hashtagQuery.map((tag, idx) => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                #{tag}
                <button
                    type="button"
                    className="ml-1 text-red-500 hover:text-red-700"
                    onClick={() =>
                        setHashtagQuery(hashtagQuery.filter((t) => t !== tag))
                    }
                >
                    ×
                </button>
            </span>
        ))}
    </div>
)}

            {/* Listado de publicaciones o estado vacío */}
            {publications.length === 0 && !loadingMore ? (
                <div className="py-16 text-center">
                    <PaperAirplaneIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        No hay publicaciones aún
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Sé el primero en compartir algo con la comunidad
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Crear primera publicación
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPublications.map((publication) => (
                            <div
                                key={publication.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                                id={`publication-${publication.id}`}
                            >
                                <div className="flex space-x-3">
                                    {publication.user.avatarURL ? (
                                        <img
                                            src={publication.user.avatarURL}
                                            alt={publication.user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                                            {publication.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-1">
                                            <p className="font-bold truncate text-gray-900 dark:text-gray-100">
                                                {publication.user.name}
                                            </p>

                                            <UserMenu
                                                userId={publication.user.id}
                                                publicationId={publication.id}
                                                friendStatus={
                                                    publication.friend_status ||
                                                    "none"
                                                }
                                                onFriendStatusChange={(
                                                    status
                                                ) => {
                                                    setPublications((prev) =>
                                                        prev.map((pub) =>
                                                            pub.user.id ===
                                                            publication.user.id
                                                                ? {
                                                                      ...pub,
                                                                      friend_status:
                                                                          status,
                                                                  }
                                                                : pub
                                                        )
                                                    );
                                                }}
                                                isOwner={
                                                    authUser.id ===
                                                    publication.user.id
                                                }
                                                isAdmin={
                                                    authUser.is_admin ||
                                                    authUser.is_moderator
                                                }
                                                following={
                                                    publication.following ||
                                                    false
                                                }
                                                onToggleFollow={(
                                                    userId,
                                                    following
                                                ) => {
                                                    setPublications((prev) =>
                                                        prev.map((pub) =>
                                                            pub.user.id ===
                                                            userId
                                                                ? {
                                                                      ...pub,
                                                                      following,
                                                                  }
                                                                : pub
                                                        )
                                                    );
                                                }}
                                                onFriendRemoved={() => {
                                                    setPublications((prev) =>
                                                        prev.map((pub) =>
                                                            pub.user.id ===
                                                            publication.user.id
                                                                ? {
                                                                      ...pub,
                                                                      friend_status:
                                                                          "none",
                                                                  }
                                                                : pub
                                                        )
                                                    );
                                                }}
                                                onDeletePublication={(
                                                    publicationId
                                                ) => {
                                                    setPublications((prev) =>
                                                        prev.filter(
                                                            (pub) =>
                                                                pub.id !==
                                                                publicationId
                                                        )
                                                    );
                                                }}
                                            />

                                            <span className="text-gray-500 dark:text-gray-400">
                                                ·
                                            </span>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {formatDate(
                                                    publication.created_at
                                                )}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-line">
                                            {publication.textContent}
                                        </p>

                                         {/* Mostrar hashtags si existen */}
                                        {publication.hashtags?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {publication.hashtags.map((tag, index) => (
                                                    <button
                                                        key={tag.id || index}
                                                        type="button"
                                                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                                                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                                                        onClick={() => handleHashtagClick(tag)}
                                                    >
                                                        #{tag.hashtag_text || tag}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                       

                                        {publication.imageURL && (
                                            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <img
                                                    src={publication.imageURL}
                                                    alt="Publicación"
                                                    className="w-full h-auto object-contain max-h-96 block"
                                                />
                                            </div>
                                        )}

                                        <div className="mt-3 flex justify-between max-w-md">
                                            <button
                                                type="button"
                                                className="flex items-center space-x-1 text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 group"
                                                onClick={() =>
                                                    (window.location.href = `publications/${publication.id}`)
                                                }
                                            >
                                                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900">
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">
                                                    {publication.responsesCount ??
                                                        0}
                                                </span>
                                            </button>
                                            <button
                                                className={`flex items-center space-x-1 ${
                                                    publication.likedByMe
                                                        ? "text-red-500"
                                                        : "text-gray-500 dark:text-gray-300"
                                                } hover:text-red-500 dark:hover:text-red-400 group`}
                                                onClick={() =>
                                                    handleLike(publication.id)
                                                }
                                            >
                                                <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900">
                                                    {publication.likedByMe ? (
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm">
                                                    {publication.likesCount}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 group"
                                                onClick={() => {
                                                    if (
                                                        !publication ||
                                                        !publication.id
                                                    ) {
                                                        Swal.fire(
                                                            "Error",
                                                            "No se encontró la publicación.",
                                                            "error"
                                                        );
                                                        return;
                                                    }
                                                    const url = `${window.location.origin}/publications/${publication.id}`;
                                                    if (
                                                        navigator.clipboard &&
                                                        typeof navigator
                                                            .clipboard
                                                            .writeText ===
                                                            "function"
                                                    ) {
                                                        navigator.clipboard
                                                            .writeText(url)
                                                            .then(() => {
                                                                Swal.fire(
                                                                    "¡Enlace copiado!",
                                                                    "El enlace de la publicación se ha copiado al portapapeles.",
                                                                    "success"
                                                                );
                                                            })
                                                            .catch(() => {
                                                                Swal.fire(
                                                                    "Error",
                                                                    "No se pudo copiar el enlace al portapapeles.",
                                                                    "error"
                                                                );
                                                            });
                                                    } else {
                                                        const tempInput =
                                                            document.createElement(
                                                                "input"
                                                            );
                                                        tempInput.value = url;
                                                        document.body.appendChild(
                                                            tempInput
                                                        );
                                                        tempInput.select();
                                                        try {
                                                            document.execCommand(
                                                                "copy"
                                                            );
                                                            Swal.fire(
                                                                "¡Enlace copiado!",
                                                                "El enlace de la publicación se ha copiado al portapapeles.",
                                                                "success"
                                                            );
                                                        } catch {
                                                            Swal.fire(
                                                                "Error",
                                                                "No se pudo copiar el enlace al portapapeles.",
                                                                "error"
                                                            );
                                                        }
                                                        document.body.removeChild(
                                                            tempInput
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900">
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                        />
                                                    </svg>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Indicador de carga */}
                    {loadingMore && (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay más publicaciones */}
                    {!nextPageUrl &&
                        publications.length > 0 &&
                        !loadingMore && (
                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                                Has visto todas las publicaciones
                            </div>
                        )}
                </>
            )}

            <ModalSearch
                open={showModal}
                onClose={() => setShowModal(false)}
                authUser={authUser}
               
            />

          
        </AuthenticatedLayout>
    );
}
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    PaperAirplaneIcon,
    PhotographIcon,
    XIcon,
} from "@heroicons/react/outline";

export default function TwitterStyleFeed({
    authUser,
    publications: initialPublications,
}) {
    const { props: pageProps } = usePage();
    // Estados para el formulario
    const { data, setData, post, processing, errors, reset } = useForm(
        {
            textContent: "",
            image: null,
            preview: null,
        },
        {
            resetOnSuccess: false, // Importante para mantener el estado
        }
    );
    const [showForm, setShowForm] = useState(false);

    // Estados para el scroll infinito
    const [publications, setPublications] = useState(
        initialPublications.data || initialPublications
    );
    const [nextPageUrl, setNextPageUrl] = useState(
        initialPublications.links?.next || initialPublications.next_page_url
    );
    const [loadingMore, setLoadingMore] = useState(false);

    // Sincronizar con props iniciales
    useEffect(() => {
        setPublications(initialPublications.data);
        setNextPageUrl(initialPublications.next_page_url);
    }, [initialPublications]);

    // Función para cargar más publicaciones
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

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.json();

            setPublications((prev) => [...prev, ...result.data]);
            setNextPageUrl(result.next_page_url);
        } catch (error) {
            console.error("Error loading more publications:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Efecto para el scroll infinito
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

    // Manejar selección de imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("image", file);

        // Mostrar previsualización
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setData("preview", reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Enviar publicación
    // Reemplaza tu handleSubmit con esta versión
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("textContent", data.textContent);
        if (data.image) {
            formData.append("image", data.image);
        }

        // Creación optimista
        const optimisticPublication = {
            id: `temp-${Date.now()}`,
            textContent: data.textContent,
            user: authUser,
            created_at: new Date().toISOString(),
            imageURL: data.preview,
            hashtags: [],
        };

        setPublications((prev) => [optimisticPublication, ...prev]);
        setShowForm(false);

        post(route("publications.store"), {
            data: formData,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setData("preview", null);

                // Usar pageProps en lugar de page
                if (pageProps.newPublication) {
                    setPublications((prev) => [
                        pageProps.newPublication,
                        ...prev.filter(
                            (p) => p.id !== optimisticPublication.id
                        ),
                    ]);
                }
            },
            onError: () => {
                setPublications((prev) =>
                    prev.filter((p) => p.id !== optimisticPublication.id)
                );
            },
        });
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const options = {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

    return (
        <AuthenticatedLayout
            user={authUser}
            header={
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Inicio
                    </h1>
                </div>
            }
        >
            <Head title="Publicaciones" />

            {/* Área para crear nueva publicación (siempre visible) */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-3">
                    <img
                        src={authUser.profile_photo_url}
                        alt={authUser.name}
                        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                    />
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
                                <img
                                    src={authUser.profile_photo_url}
                                    alt={authUser.name}
                                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                                />
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
                                                className="rounded-xl max-h-80 w-full object-cover"
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
                        {publications.map((publication) => (
                            <div
                                key={publication.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                            >
                                <div className="flex space-x-3">
                                    <img
                                        src={
                                            publication.user
                                                .profile_photo_url ||
                                            "/default-user.png"
                                        }
                                        alt={publication.user.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-1">
                                            <p className="font-bold truncate text-gray-900 dark:text-gray-100">
                                                {publication.user.name}
                                            </p>
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

                                        {publication.imageURL && (
                                            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <img
                                                    src={publication.imageURL}
                                                    alt="Publicación"
                                                    className="w-full h-auto max-h-96 object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="mt-3 flex justify-between max-w-md">
                                            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 group">
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
                                                    0
                                                </span>
                                            </button>

                                            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 group">
                                                <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900">
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
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">
                                                    0
                                                </span>
                                            </button>

                                            <button className="flex items-center text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 group">
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
        </AuthenticatedLayout>
    );
}

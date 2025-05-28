import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

export default function ModalAlerts({
    open,
    onClose,
    imageURL
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 text-black dark:text-white relative w-auto h-auto max-w-full max-h-full flex items-center justify-center"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
                    aria-label="Cerrar"
                >
                    <FaTimes />
                </button>

                <img src={imageURL} alt="Imagen de publicación" className="max-w-full max-h-[80vh] w-auto h-auto block mx-auto" />

            </div>
        </div>
    );
}

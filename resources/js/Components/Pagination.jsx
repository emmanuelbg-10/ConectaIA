import React from "react";

export default function Pagination({ links }) {
    return (
        <nav className="flex items-center justify-between">
            <ul className="flex space-x-2">
                {links.map((link, index) => {
                    // Reemplaza las claves específicas con los textos deseados
                    const label = link.label
                        .replace("pagination.previous", "Atrás")
                        .replace("pagination.next", "Siguiente")
                        .replace("Previous", "Atrás") // Para casos donde solo sea "Previous"
                        .replace("Next", "Siguiente"); // Para casos donde solo sea "Next"

                    return (
                        <li key={index}>
                            <a
                                href={link.url || "#"}
                                className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#214478] ${
                                    link.active
                                        ? "bg-[#214478] text-white border-[#214478]"
                                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

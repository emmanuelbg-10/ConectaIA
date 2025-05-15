// filepath: resources/js/Components/Pagination.jsx
import React from "react";

export default function Pagination({ links }) {
    return (
        <nav className="flex items-center justify-between">
            <ul className="flex space-x-2">
                {links.map((link, index) => (
                    <li key={index}>
                        <a
                            href={link.url || "#"}
                            className={`px-4 py-2 border rounded ${
                                link.active
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-blue-500"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
}
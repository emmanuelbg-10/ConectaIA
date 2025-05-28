import { Link } from "@inertiajs/react";
import clsx from "clsx";

export default function NavLink({
    active = false,
    icon: Icon,
    label,
    className = "",
    ...props
}) {
    return (
        <Link
            {...props}
            className={clsx(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 text-sm font-medium transition duration-150 ease-in-out",
                active
                    ? "text-[#214478] dark:text-[#214478]"
                    : "text-gray-500 hover:text-[#214478] dark:text-gray-400 dark:hover:text-[#214478]",
                className
            )}
        >
            <Icon className="h-6 w-6" />
            <span className="hidden md:block">{label}</span>
        </Link>
    );
}

export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `px-6 py-2 border border-black dark:border-white text-black dark:text-white font-kanit rounded-md hover:border-[#214478] transition ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                } ` + className
            }
        >
            {children}
        </button>
    );
}

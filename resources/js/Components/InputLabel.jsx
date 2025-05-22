export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                "block text-sm font-medium text-black dark:text-white mb-1 " +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}

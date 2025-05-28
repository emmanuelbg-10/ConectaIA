export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "appearance-none h-4 w-4 border border-black dark:border-white rounded-sm bg-transparent checked:bg-[#214478] checked:border-[#214478] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#214478] " +
                className
            }
        />
    );
}

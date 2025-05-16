export default function ApplicationLogo({ className = "", ...props }) {
    return (
        <img
            src="/ConectaIA/public/logo.png"
            alt="Logo"
            className={`h-10 w-10 ${className}`}
            {...props}
        />
    );
}

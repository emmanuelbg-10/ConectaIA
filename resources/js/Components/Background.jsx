import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
export default function Background() {
    const [init, setInit] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Detecta si está activado el modo oscuro
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setDarkMode(mediaQuery.matches);

        const handleChange = (e) => setDarkMode(e.matches);
        mediaQuery.addEventListener("change", handleChange);

        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <div className="bg-white dark:bg-black absolute inset-0 -z-10">
            {init && (
                <Particles
                    id="tsparticles"
                    style={{ zIndex: 1 }}
                    options={{
                        background: {
                            color: {
                                value: darkMode ? "#000000" : "#ffffff",
                            },
                        },
                        fpsLimit: 120,
                        particles: {
                            color: {
                                value: "#ffffff",
                            },
                            links: {
                                color: darkMode ? "#ffffff" : "#214478",
                                distance: 150,
                                enable: true,
                                opacity: 1,
                                width: 1,
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: {
                                    default: "bounce",
                                },
                                random: false,
                                speed: 1.2,
                                straight: false,
                            },
                            number: {
                                density: {
                                    enable: true,
                                    area: 800,
                                },
                                value: 200,
                            },
                            opacity: {
                                value: 0.25,
                            },
                            shape: {
                                type: "circle",
                            },
                            size: {
                                value: { min: 1, max: 3 },
                            },
                        },
                        detectRetina: true,
                    }}
                />
            )}
        </div>
    );
}

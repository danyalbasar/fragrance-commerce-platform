"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getPublicSettings } from "@/services/siteSettingsService";
import { getThemeById, applyTheme, type ThemePreset } from "@/lib/themes";

interface ThemeContextType {
    themeId: string;
    theme: ThemePreset;
    setTheme: (id: string) => void;
    loaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    themeId: "classic-gold",
    theme: getThemeById("classic-gold"),
    setTheme: () => {},
    loaded: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeId, setThemeId] = useState("classic-gold");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getPublicSettings()
            .then((settings) => {
                if (cancelled) return;
                const id = settings.active_theme || "classic-gold";
                const preset = getThemeById(id);
                applyTheme(preset);
                setThemeId(id);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });

        return () => { cancelled = true; };
    }, []);

    const setTheme = useCallback((id: string) => {
        const preset = getThemeById(id);
        applyTheme(preset);
        setThemeId(id);
    }, []);

    return (
        <ThemeContext.Provider value={{ themeId, theme: getThemeById(themeId), setTheme, loaded }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

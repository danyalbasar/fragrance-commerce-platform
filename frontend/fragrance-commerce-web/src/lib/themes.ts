export interface ThemePreset {
    id: string;
    name: string;
    colors: {
        ink: string;
        ivory: string;
        paper: string;
        gold: string;
        goldStrong: string;
        moss: string;
        muted: string;
        mutedStrong: string;
        line: string;
        sand: string;
        input: string;
    };
}

export const themePresets: ThemePreset[] = [
    {
        id: "classic-gold",
        name: "Classic Gold",
        colors: {
            ink: "#16120d",
            ivory: "#f7f2ea",
            paper: "#fffaf2",
            gold: "#b68a42",
            goldStrong: "#80661e",
            moss: "#28352b",
            muted: "#766d61",
            mutedStrong: "#5f574e",
            line: "#d8c8ad",
            sand: "#efe3d0",
            input: "#fffaf2",
        },
    },
    {
        id: "midnight-noir",
        name: "Midnight Noir",
        colors: {
            ink: "#f0ece4",
            ivory: "#1a1a1a",
            paper: "#242424",
            gold: "#c9a84c",
            goldStrong: "#d4b85c",
            moss: "#3a4a3c",
            muted: "#9a9490",
            mutedStrong: "#b0aaa4",
            line: "#3a3632",
            sand: "#2a2826",
            input: "#2e2c2a",
        },
    },
    {
        id: "sage-stone",
        name: "Sage & Stone",
        colors: {
            ink: "#2c3029",
            ivory: "#f2f0eb",
            paper: "#faf9f6",
            gold: "#8a9a6b",
            goldStrong: "#6b7d52",
            moss: "#4a5d45",
            muted: "#7a7d74",
            mutedStrong: "#5e6159",
            line: "#c5c9be",
            sand: "#e8e6df",
            input: "#faf9f6",
        },
    },
    {
        id: "rose-quartz",
        name: "Rose Quartz",
        colors: {
            ink: "#2d2428",
            ivory: "#faf5f7",
            paper: "#fefcfd",
            gold: "#b8808a",
            goldStrong: "#9a6270",
            moss: "#6b4a55",
            muted: "#9a8a90",
            mutedStrong: "#7a6a70",
            line: "#d8c5cb",
            sand: "#efe3e7",
            input: "#fefcfd",
        },
    },
];

export function getThemeById(id: string): ThemePreset {
    return themePresets.find((t) => t.id === id) ?? themePresets[0];
}

export function applyTheme(preset: ThemePreset) {
    const root = document.documentElement;
    root.style.setProperty("--luxury-ink", preset.colors.ink);
    root.style.setProperty("--luxury-ivory", preset.colors.ivory);
    root.style.setProperty("--luxury-paper", preset.colors.paper);
    root.style.setProperty("--luxury-gold", preset.colors.gold);
    root.style.setProperty("--luxury-gold-strong", preset.colors.goldStrong);
    root.style.setProperty("--luxury-moss", preset.colors.moss);
    root.style.setProperty("--luxury-muted", preset.colors.muted);
    root.style.setProperty("--luxury-muted-strong", preset.colors.mutedStrong);
    root.style.setProperty("--luxury-line", preset.colors.line);
    root.style.setProperty("--luxury-sand", preset.colors.sand);
    root.style.setProperty("--luxury-input", preset.colors.input);
    root.style.setProperty("--background", preset.colors.ivory);
    root.style.setProperty("--foreground", preset.colors.ink);
}

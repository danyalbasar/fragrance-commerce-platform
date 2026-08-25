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
    {
        id: "obsidian-velvet",
        name: "Obsidian Velvet",
        colors: {
            ink: "#eae6f0",
            ivory: "#13111a",
            paper: "#1c1a24",
            gold: "#a78bba",
            goldStrong: "#c4a8d8",
            moss: "#3d2e52",
            muted: "#8a8494",
            mutedStrong: "#a09aae",
            line: "#352f42",
            sand: "#252230",
            input: "#201e28",
        },
    },
    {
        id: "ocean-mist",
        name: "Ocean Mist",
        colors: {
            ink: "#1a2a32",
            ivory: "#f0f5f7",
            paper: "#fafcfd",
            gold: "#4a8fa8",
            goldStrong: "#3a7590",
            moss: "#2c5e6e",
            muted: "#6a8a94",
            mutedStrong: "#4a6a74",
            line: "#c0d4dc",
            sand: "#dde8ed",
            input: "#fafcfd",
        },
    },
    {
        id: "desert-sand",
        name: "Desert Sand",
        colors: {
            ink: "#2e2218",
            ivory: "#f7f0e6",
            paper: "#fefaf2",
            gold: "#c4884a",
            goldStrong: "#a06a30",
            moss: "#8a5a3a",
            muted: "#8a7e70",
            mutedStrong: "#6a5e50",
            line: "#d8c0a0",
            sand: "#ede0cc",
            input: "#fefaf2",
        },
    },
    {
        id: "forest-bloom",
        name: "Forest Bloom",
        colors: {
            ink: "#1a2420",
            ivory: "#f0f5f0",
            paper: "#fafcf8",
            gold: "#6a9a6a",
            goldStrong: "#4a7a4a",
            moss: "#2a4a30",
            muted: "#6a7a6a",
            mutedStrong: "#4a5a4a",
            line: "#b8d0b8",
            sand: "#dde8dd",
            input: "#fafcf8",
        },
    },
    {
        id: "pearl-silver",
        name: "Pearl & Silver",
        colors: {
            ink: "#1e1e22",
            ivory: "#f5f5f7",
            paper: "#fafafa",
            gold: "#8a8a96",
            goldStrong: "#6a6a78",
            moss: "#4a4a56",
            muted: "#8a8a92",
            mutedStrong: "#6a6a72",
            line: "#d0d0d8",
            sand: "#e8e8ec",
            input: "#fafafa",
        },
    },
    {
        id: "amber-dusk",
        name: "Amber Dusk",
        colors: {
            ink: "#241c14",
            ivory: "#f7f0e4",
            paper: "#fefbf2",
            gold: "#c8943a",
            goldStrong: "#a87828",
            moss: "#7a5a30",
            muted: "#8a7a68",
            mutedStrong: "#6a5a48",
            line: "#d8c4a0",
            sand: "#ede0c8",
            input: "#fefbf2",
        },
    },
    {
        id: "ivory-charcoal",
        name: "Ivory Charcoal",
        colors: {
            ink: "#1a1a1a",
            ivory: "#f8f8f8",
            paper: "#ffffff",
            gold: "#4a4a4a",
            goldStrong: "#2a2a2a",
            moss: "#3a3a3a",
            muted: "#8a8a8a",
            mutedStrong: "#6a6a6a",
            line: "#d0d0d0",
            sand: "#e8e8e8",
            input: "#ffffff",
        },
    },
    {
        id: "blush-nude",
        name: "Blush Nude",
        colors: {
            ink: "#2e2228",
            ivory: "#faf5f0",
            paper: "#fefcf9",
            gold: "#c89878",
            goldStrong: "#a87858",
            moss: "#8a6a58",
            muted: "#9a8a82",
            mutedStrong: "#7a6a62",
            line: "#d8c4b8",
            sand: "#ede2d8",
            input: "#fefcf9",
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

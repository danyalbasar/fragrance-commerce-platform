const PREFIX = "fcp:";

function keyFor(name: string): string {
    const token =
        typeof window === "undefined"
            ? ""
            : (localStorage.getItem("token") ?? "").slice(0, 16);

    return `${PREFIX}${name}:${token}`;
}

export function readCache<T>(name: string): T | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(keyFor(name));

        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export function writeCache(name: string, value: unknown): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(keyFor(name), JSON.stringify(value));
    } catch {}
}

export function clearUserCache(): void {
    if (typeof window === "undefined") return;

    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(PREFIX)) keys.push(key);
    }

    keys.forEach((key) => localStorage.removeItem(key));
}

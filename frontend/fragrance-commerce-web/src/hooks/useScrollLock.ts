import { useLayoutEffect } from "react";

export function useScrollLock(locked: boolean) {
    useLayoutEffect(() => {
        if (!locked) return;

        const scrollY = window.scrollY;
        const html = document.documentElement;
        const body = document.body;

        const origHtmlOverflow = html.style.overflow;
        const origBodyOverflow = body.style.overflow;
        const origBodyPosition = body.style.position;
        const origBodyTop = body.style.top;
        const origBodyWidth = body.style.width;
        const origScrollBehavior = html.style.scrollBehavior;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";

        return () => {
            html.style.scrollBehavior = "auto";
            html.style.overflow = origHtmlOverflow;
            body.style.overflow = origBodyOverflow;
            body.style.position = origBodyPosition;
            body.style.top = origBodyTop;
            body.style.width = origBodyWidth;
            window.scrollTo({ top: scrollY, behavior: "instant" });
            html.style.scrollBehavior = origScrollBehavior;
        };
    }, [locked]);
}

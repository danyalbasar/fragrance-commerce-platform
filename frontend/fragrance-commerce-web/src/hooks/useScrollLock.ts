import { useEffect } from "react";

export function useScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        const scrollY = window.scrollY;
        const html = document.documentElement;
        const body = document.body;

        const origHtmlOverflow = html.style.overflow;
        const origBodyOverflow = body.style.overflow;
        const origBodyPosition = body.style.position;
        const origBodyTop = body.style.top;
        const origBodyWidth = body.style.width;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";

        return () => {
            html.style.overflow = origHtmlOverflow;
            body.style.overflow = origBodyOverflow;
            body.style.position = origBodyPosition;
            body.style.top = origBodyTop;
            body.style.width = origBodyWidth;
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        };
    }, [locked]);
}

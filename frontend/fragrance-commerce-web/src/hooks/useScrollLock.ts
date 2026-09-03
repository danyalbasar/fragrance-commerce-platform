import { useEffect } from "react";

export function useScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        const scrollY = window.scrollY;
        const html = document.documentElement;

        const origHtmlOverflow = html.style.overflow;
        const origHtmlPosition = html.style.position;
        const origHtmlTop = html.style.top;
        const origHtmlWidth = html.style.width;

        html.style.overflow = "hidden";
        html.style.position = "fixed";
        html.style.top = `-${scrollY}px`;
        html.style.width = "100%";

        return () => {
            html.style.overflow = origHtmlOverflow;
            html.style.position = origHtmlPosition;
            html.style.top = origHtmlTop;
            html.style.width = origHtmlWidth;
            window.scrollTo(0, scrollY);
        };
    }, [locked]);
}

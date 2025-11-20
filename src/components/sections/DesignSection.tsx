"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Studio3View, { StudioView } from "@/components/design/Studio3View";

const viewFromPath = (pathname: string | null): StudioView => {
    if (pathname?.includes("/design/studio3/w245")) return "w245";
    return "w13";
};

export default function DesignSection() {
    const router = useRouter();
    const pathname = usePathname();
    const [activeView, setActiveView] = useState<StudioView>(viewFromPath(pathname));

    useEffect(() => {
        const nextView = viewFromPath(pathname);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveView(nextView);
    }, [pathname]);

    const toggleButtons = useMemo(
        () => [
            { label: "W1 / W3", view: "w13" as StudioView, href: "/design/studio3/w13" },
            { label: "W2 / W4 / W5", view: "w245" as StudioView, href: "/design/studio3/w245" },
        ],
        []
    );

    const handleNavigate = (view: StudioView, href: string) => {
        setActiveView(view);
        router.push(href);
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            <div className="flex-1 flex items-start justify-center px-6 py-4 md:px-10 pr-40 md:pr-56">
                <Studio3View view={activeView} />
            </div>

            <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 w-32 md:w-40">
                {toggleButtons.map((button) => {
                    const isActive = activeView === button.view;
                    return (
                        <button
                            key={button.view}
                            onClick={() => handleNavigate(button.view, button.href)}
                            className={`w-full px-4 md:px-5 py-3 rounded-none border text-sm font-bold tracking-[0.12em] text-center transition-colors ${isActive
                                    ? "bg-white text-black border-white"
                                    : "bg-white/5 text-white border-white/20 hover:bg-white/10"
                                }`}
                        >
                            {button.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";

interface SectionContainerProps {
    children: React.ReactNode;
    isActive: boolean;
}

export default function SectionContainer({
    children,
    isActive,
}: SectionContainerProps) {
    const [shouldRender, setShouldRender] = useState(isActive);
    const [animationState, setAnimationState] = useState<"entering" | "exiting" | "hidden" | "visible">(
        isActive ? "visible" : "hidden"
    );

    useEffect(() => {
        if (isActive) {
            setShouldRender(true);
            setAnimationState("entering");
            const timer = setTimeout(() => setAnimationState("visible"), 10); // Small delay to trigger transition
            return () => clearTimeout(timer);
        } else {
            setAnimationState("exiting");
            const timer = setTimeout(() => {
                setShouldRender(false);
                setAnimationState("hidden");
            }, 400); // Match duration
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!shouldRender) return null;

    let transformClass = "";
    let opacityClass = "";

    switch (animationState) {
        case "entering":
            transformClass = "-translate-y-5";
            opacityClass = "opacity-0";
            break;
        case "visible":
            transformClass = "translate-y-0";
            opacityClass = "opacity-100";
            break;
        case "exiting":
            transformClass = "-translate-y-5";
            opacityClass = "opacity-0";
            break;
        case "hidden":
            transformClass = "-translate-y-5";
            opacityClass = "opacity-0";
            break;
    }

    // Override for entering state to ensure it starts from top
    if (animationState === "entering") {
        // Actually, for entering we want to start from top (translateY(-20px) or similar) and go to 0
        // For exiting we want to go up (translateY(-20px))

        // Let's refine the logic based on the request:
        // Old section: translateY(-10 to -20px) and opacity -> 0
        // New section: translateY(10 to 20px) to 0 and opacity 0 -> 1
    }

    // Let's simplify the logic with a key change detection in the parent, 
    // but since we are wrapping each section, we need to handle enter/exit.

    // Actually, the requirement says:
    // Old section: translateY(-10 to -20px) and opacity → 0.
    // New section: translateY(10 to 20px) to 0 and opacity from 0 → 1.

    // So:
    // Exiting: translate-y-[-20px] opacity-0
    // Entering (initial): translate-y-[20px] opacity-0
    // Active: translate-y-0 opacity-100

    const getClasses = () => {
        if (animationState === 'entering') return "translate-y-[20px] opacity-0";
        if (animationState === 'visible') return "translate-y-0 opacity-100";
        if (animationState === 'exiting') return "-translate-y-[20px] opacity-0";
        return "hidden";
    }

    return (
        <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ease-out ${getClasses()}`}
        >
            {children}
        </div>
    );
}

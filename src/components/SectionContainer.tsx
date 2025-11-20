/* eslint-disable react-hooks/set-state-in-effect */
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

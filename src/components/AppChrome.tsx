"use client";

import React, { useEffect, useState } from "react";
import { SectionKey } from "@/types/sections";
import Menu from "./Menu";
import StudioLabel from "./StudioLabel";
import Silk from "./Silk";

interface AppChromeProps {
    activeSection: SectionKey;
    onSelectSection: (section: SectionKey) => void;
    children: React.ReactNode;
}

export default function AppChrome({ activeSection, onSelectSection, children }: AppChromeProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(activeSection === "START");

    useEffect(() => {
        setIsMenuOpen(activeSection === "START");
    }, [activeSection]);

    const handleSelect = (section: SectionKey) => {
        onSelectSection(section);
        setIsMenuOpen(section === "START");
    };

    return (
        <main className="relative w-full h-full overflow-hidden bg-black text-white">
            <div className="fixed inset-0 z-0">
                <Silk speed={2} scale={1.5} color="#2A2A2A" noiseIntensity={0.5} rotation={0} />
            </div>

            <button
                onClick={() => setIsMenuOpen(true)}
                className="fixed top-8 left-8 z-40 flex flex-col justify-between w-8 h-6 cursor-pointer hover:opacity-70 transition-opacity"
                aria-label="Open Menu"
            >
                <span className="w-full h-0.5 bg-white"></span>
                <span className="w-full h-0.5 bg-white"></span>
                <span className="w-full h-0.5 bg-white"></span>
            </button>

            <Menu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                activeSection={activeSection}
                onSelectSection={handleSelect}
            />

            {activeSection === "START" && <StudioLabel />}

            <div className="relative w-full h-full flex items-center justify-center z-10 overflow-hidden">
                {children}
            </div>
        </main>
    );
}

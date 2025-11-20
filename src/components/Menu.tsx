"use client";

import React from "react";
import { SectionKey } from "@/types/sections";

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeSection: SectionKey;
    onSelectSection: (section: SectionKey) => void;
}

const MENU_ITEMS: SectionKey[] = ["START", "DESIGN", "RENDER", "ENGINEERING"];

export default function Menu({
    isOpen,
    onClose,
    activeSection,
    onSelectSection,
}: MenuProps) {
    return (
        <>
            {/* Backdrop (optional, for clicking outside to close) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sliding Panel */}
            <div
                className={`fixed top-0 left-0 z-50 h-full w-[70%] md:w-[30%] bg-white text-black transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col justify-center h-full px-8 md:px-12 space-y-8">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item}
                            onClick={() => onSelectSection(item)}
                            className={`text-left text-3xl md:text-5xl font-display font-bold tracking-tighter whitespace-nowrap transition-colors duration-200 ${activeSection === item ? "text-black" : "text-gray-300 hover:text-gray-500"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

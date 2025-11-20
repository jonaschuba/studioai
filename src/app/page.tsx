"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppChrome from "@/components/AppChrome";
import SectionContainer from "@/components/SectionContainer";
import StartSection from "@/components/sections/StartSection";
import DesignSection from "@/components/sections/DesignSection";
import RenderSection from "@/components/sections/RenderSection";
import EngineeringSection from "@/components/sections/EngineeringSection";
import { SectionKey } from "@/types/sections";

const SECTIONS: SectionKey[] = ["START", "DESIGN", "RENDER", "ENGINEERING"];

const isSectionKey = (value: string): value is SectionKey =>
    SECTIONS.includes(value.toUpperCase() as SectionKey);

export default function Home() {
    const searchParams = useSearchParams();
    const sectionParam = searchParams.get("section") ?? "";
    const [activeSection, setActiveSection] = useState<SectionKey>(
        isSectionKey(sectionParam) ? (sectionParam.toUpperCase() as SectionKey) : "START"
    );

    useEffect(() => {
        if (isSectionKey(sectionParam)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveSection(sectionParam.toUpperCase() as SectionKey);
        }
    }, [sectionParam]);

    const handleSectionSelect = (section: SectionKey) => {
        setActiveSection(section);
    };

    return (
        <AppChrome activeSection={activeSection} onSelectSection={handleSectionSelect}>
            <SectionContainer isActive={activeSection === "START"}>
                <StartSection />
            </SectionContainer>
            <SectionContainer isActive={activeSection === "DESIGN"}>
                <DesignSection />
            </SectionContainer>
            <SectionContainer isActive={activeSection === "RENDER"}>
                <RenderSection />
            </SectionContainer>
            <SectionContainer isActive={activeSection === "ENGINEERING"}>
                <EngineeringSection />
            </SectionContainer>
        </AppChrome>
    );
}

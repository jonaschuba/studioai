"use client";

import { useRouter } from "next/navigation";
import AppChrome from "@/components/AppChrome";
import SectionContainer from "@/components/SectionContainer";
import DesignSection from "@/components/sections/DesignSection";
import { SectionKey } from "@/types/sections";

export default function Studio3W13Page() {
    const router = useRouter();

    const handleSectionSelect = (section: SectionKey) => {
        if (section === "START") router.push("/");
        else if (section === "DESIGN") router.push("/design/studio3/w13");
        else if (section === "RENDER") router.push("/?section=RENDER");
        else if (section === "ENGINEERING") router.push("/?section=ENGINEERING");
    };

    return (
        <AppChrome activeSection="DESIGN" onSelectSection={handleSectionSelect}>
            <SectionContainer isActive>
                <DesignSection />
            </SectionContainer>
        </AppChrome>
    );
}

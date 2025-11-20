"use client";

import { ReactNode } from "react";
import { WallImageProvider } from "@/components/design/WallImageContext";

export default function Providers({ children }: { children: ReactNode }) {
    return <WallImageProvider>{children}</WallImageProvider>;
}

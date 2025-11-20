import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "./providers";

const rtlUnited = localFont({
    src: [
        { path: "./fonts/RTLUnitedTextLight.ttf", weight: "300", style: "normal" },
        { path: "./fonts/RTLUnitedTextRegular.ttf", weight: "400", style: "normal" },
        { path: "./fonts/RTLUnitedTextBold.ttf", weight: "700", style: "normal" },
    ],
    variable: "--font-rtl",
});

export const metadata: Metadata = {
    title: "Studio AI",
    description: "Minimal production-ready UI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${rtlUnited.variable} antialiased bg-black text-white h-screen w-screen overflow-hidden`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

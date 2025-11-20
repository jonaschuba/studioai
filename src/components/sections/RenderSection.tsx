import Link from "next/link";

const links = [
    { href: "/render/studio3/w13", label: "W1 / W3" },
    { href: "/render/studio3/w245", label: "W2 / W4 / W5" },
];

export default function RenderSection() {
    return (
        <div className="w-full h-full flex items-center justify-center px-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="bg-white text-black px-6 py-4 flex flex-col leading-tight shadow-lg hover:bg-white/90 transition-colors min-w-[160px] text-center"
                    >
                        <span className="text-xl font-bold tracking-tight">Studio 3</span>
                        <span className="text-sm font-normal tracking-wide">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useWallImages, WallId, WallTransform } from "@/components/design/WallImageContext";

type WallConfig = {
    id: WallId;
    x: number;
    y: number;
    width: number;
    height: number;
};

const CANVAS = { width: 3840, height: 2160 };

const W245_WALLS: WallConfig[] = [
    { id: "W2", x: 0, y: 0, width: 1152, height: 1944 },
    { id: "W4", x: 1152, y: 0, width: 1152, height: 1944 },
    { id: "W5", x: 2304, y: 0, width: 1152, height: 1944 },
];

const baseTransform: WallTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

function useCanvasSize(canvasWidth: number, canvasHeight: number) {
    const ratio = canvasWidth / canvasHeight;
    const [size, setSize] = useState({ width: canvasWidth, height: canvasHeight });

    useEffect(() => {
        const update = () => {
            const { innerWidth, innerHeight } = window;
            const widthToFit = Math.min(innerWidth, innerHeight * ratio);
            setSize({ width: widthToFit, height: widthToFit / ratio });
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [canvasWidth, canvasHeight]);

    return size;
}

function WallLayer({
    wall,
    src,
    transform,
    containerWidth,
    containerHeight,
}: {
    wall: WallConfig;
    src?: string;
    transform: WallTransform;
    containerWidth: number;
    containerHeight: number;
}) {
    const left = (wall.x / CANVAS.width) * 100;
    const top = (wall.y / CANVAS.height) * 100;
    const width = (wall.width / CANVAS.width) * 100;
    const height = (wall.height / CANVAS.height) * 100;

    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

    const wallPixelWidth = (wall.width / CANVAS.width) * containerWidth;
    const wallPixelHeight = (wall.height / CANVAS.height) * containerHeight;

    const baseScale =
        naturalSize && naturalSize.width > 0 && naturalSize.height > 0
            ? Math.max(wallPixelWidth / naturalSize.width, wallPixelHeight / naturalSize.height)
            : 1;

    return (
        <div
            className="absolute overflow-hidden bg-black"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt={`${wall.id} render`}
                    className="absolute"
                    style={{
                        top: "50%",
                        left: "50%",
                        width: naturalSize?.width ?? "auto",
                        height: naturalSize?.height ?? "auto",
                        transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${baseScale * transform.scale}) rotate(${transform.rotation}deg)`,
                        transformOrigin: "center",
                        maxWidth: "none",
                        maxHeight: "none",
                    }}
                    onLoad={(e) =>
                        setNaturalSize({
                            width: e.currentTarget.naturalWidth,
                            height: e.currentTarget.naturalHeight,
                        })
                    }
                />
            ) : null}
        </div>
    );
}

export default function RenderW245Page() {
    const { images } = useWallImages();
    const size = useCanvasSize(CANVAS.width, CANVAS.height);

    const wallData = useMemo(
        () =>
            W245_WALLS.map((wall) => {
                const data = images[wall.id];
                return {
                    wall,
                    src: data?.src,
                    transform: data?.transform ?? baseTransform,
                };
            }),
        [images]
    );

    return (
        <div className="w-screen h-screen bg-black relative overflow-hidden">
            <Link
                href="/render/studio3/w245"
                className="absolute top-6 left-6 bg-white text-black px-6 py-4 flex flex-col leading-tight shadow-lg hover:bg-white/90"
            >
                <span className="text-xl font-bold tracking-tight">Studio 3</span>
                <span className="text-sm font-normal tracking-wide">W2 / W4 / W5</span>
            </Link>

            <div
                className="absolute top-0 left-0 bg-black overflow-hidden"
                style={{
                    width: size.width,
                    height: size.height,
                }}
            >
                {wallData.map(({ wall, src, transform }) => (
                    <WallLayer
                        key={wall.id}
                        wall={wall}
                        src={src}
                        transform={transform}
                        containerWidth={size.width}
                        containerHeight={size.height}
                    />
                ))}
            </div>
        </div>
    );
}

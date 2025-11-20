"use client";

import React, { useEffect, useRef, useState } from "react";
import WallDropZone from "./WallDropZone";
import { useWallImages, WallImageState, WallId, WallTransform } from "./WallImageContext";

export type StudioView = "w13" | "w245";

const GAP_PX = 24; // Matches gap-6 tailwind spacing
const LABEL_PX = 32; // Reserve space for label text and spacing

const LANDSCAPE = { width: 2880, height: 810 }; // W1/W3
const PORTRAIT = { width: 1152, height: 1944 }; // W2/W4/W5

function useElementSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, size };
}

interface LayoutProps {
    availableWidth: number;
    availableHeight: number;
    images: WallImageState;
    onSelectFile: (wallId: WallId, file: File) => void;
    onUpdateTransform: (wallId: WallId, partial: Partial<WallTransform>) => void;
    onResetTransform: (wallId: WallId) => void;
    onClearImage: (wallId: WallId) => void;
}

export default function Studio3View({ view }: { view: StudioView }) {
    const { images, setImage, updateTransform, resetTransform, clearImage } = useWallImages();
    const { ref, size } = useElementSize<HTMLDivElement>();

    const handleFile = (wallId: WallId, file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                setImage(wallId, result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div
                ref={ref}
                className="relative w-full h-full max-w-[1250px] max-h-[860px] min-w-[340px] min-h-[340px]"
            >
                {view === "w13" ? (
                    <StackedLandscape
                        availableWidth={size.width}
                        availableHeight={size.height}
                        images={images}
                        onSelectFile={handleFile}
                        onUpdateTransform={updateTransform}
                        onResetTransform={resetTransform}
                        onClearImage={clearImage}
                    />
                ) : (
                    <PortraitRow
                        availableWidth={size.width}
                        availableHeight={size.height}
                        images={images}
                        onSelectFile={handleFile}
                        onUpdateTransform={updateTransform}
                        onResetTransform={resetTransform}
                        onClearImage={clearImage}
                    />
                )}
            </div>
        </div>
    );
}

function StackedLandscape({
    availableWidth,
    availableHeight,
    images,
    onSelectFile,
    onUpdateTransform,
    onResetTransform,
    onClearImage,
}: LayoutProps) {
    const totalHeight = LANDSCAPE.height * 2;
    const effectiveHeight = availableHeight - GAP_PX - LABEL_PX * 2;
    const adjustedScale =
        availableWidth && availableHeight
            ? Math.min(availableWidth / LANDSCAPE.width, effectiveHeight / totalHeight)
            : 0.3;
    const safeScale = Math.max(adjustedScale, 0.1);

    const width = LANDSCAPE.width * safeScale;
    const height = LANDSCAPE.height * safeScale;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <WallWithLabel
                id="W1"
                width={width}
                height={height}
                imageState={images.W1}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
            <WallWithLabel
                id="W3"
                width={width}
                height={height}
                imageState={images.W3}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
        </div>
    );
}

function PortraitRow({
    availableWidth,
    availableHeight,
    images,
    onSelectFile,
    onUpdateTransform,
    onResetTransform,
    onClearImage,
}: LayoutProps) {
    const totalWidth = PORTRAIT.width * 3;
    const effectiveWidth = availableWidth - GAP_PX * 2;
    const effectiveHeight = availableHeight - LABEL_PX;
    const scale =
        availableWidth && availableHeight
            ? Math.min(effectiveWidth / totalWidth, effectiveHeight / PORTRAIT.height)
            : 0.3;
    const safeScale = Math.max(scale, 0.1);

    const width = PORTRAIT.width * safeScale;
    const height = PORTRAIT.height * safeScale;

    return (
        <div className="w-full h-full flex items-center justify-center gap-6">
            <WallWithLabel
                id="W2"
                width={width}
                height={height}
                imageState={images.W2}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
            <WallWithLabel
                id="W4"
                width={width}
                height={height}
                imageState={images.W4}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
            <WallWithLabel
                id="W5"
                width={width}
                height={height}
                imageState={images.W5}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
        </div>
    );
}

function WallWithLabel({
    id,
    width,
    height,
    imageState,
    onSelectFile,
    onUpdateTransform,
    onResetTransform,
    onClearImage,
}: {
    id: WallId;
    width: number;
    height: number;
    imageState: WallImageState[WallId];
    onSelectFile: (wallId: WallId, file: File) => void;
    onUpdateTransform: (wallId: WallId, partial: Partial<WallTransform>) => void;
    onResetTransform: (wallId: WallId) => void;
    onClearImage: (wallId: WallId) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-3">
            <WallDropZone
                wallId={id}
                width={width}
                height={height}
                imageState={imageState}
                onSelectFile={onSelectFile}
                onUpdateTransform={onUpdateTransform}
                onResetTransform={onResetTransform}
                onClearImage={onClearImage}
            />
            <div className="text-sm md:text-base uppercase tracking-[0.2em] font-[var(--font-rtl)] font-bold text-white/80 text-center">
                {id}
            </div>
        </div>
    );
}

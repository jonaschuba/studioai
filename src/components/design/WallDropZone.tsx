/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { WallId, WallTransform } from "./WallImageContext";

interface WallDropZoneProps {
    wallId: WallId;
    width: number;
    height: number;
    imageState?: { src: string; transform: WallTransform };
    onSelectFile: (wallId: WallId, file: File) => void;
    onUpdateTransform: (wallId: WallId, partial: Partial<WallTransform>) => void;
    onResetTransform: (wallId: WallId) => void;
    onClearImage: (wallId: WallId) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function WallDropZone({
    wallId,
    width,
    height,
    imageState,
    onSelectFile,
    onUpdateTransform,
    onResetTransform,
    onClearImage,
}: WallDropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHoveringDrop, setIsHoveringDrop] = useState(false);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(
        null
    );
    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

    const baseScale = useMemo(() => {
        if (!naturalSize) return 1;
        return Math.max(width / naturalSize.width, height / naturalSize.height);
    }, [naturalSize, width, height]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNaturalSize(null);
    }, [imageState?.src]);

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            onSelectFile(wallId, file);
        }
    };

    const beginDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!imageState) return;
        event.preventDefault();
        setIsDraggingImage(true);
        dragStart.current = {
            x: event.clientX,
            y: event.clientY,
            originX: imageState.transform.x,
            originY: imageState.transform.y,
        };
    };

    useEffect(() => {
        if (!isDraggingImage) return;
        const handleMove = (event: MouseEvent) => {
            event.preventDefault();
            if (!dragStart.current) return;
            const dx = event.clientX - dragStart.current.x;
            const dy = event.clientY - dragStart.current.y;
            onUpdateTransform(wallId, {
                x: dragStart.current.originX + dx,
                y: dragStart.current.originY + dy,
            });
        };
        const handleUp = () => {
            setIsDraggingImage(false);
            dragStart.current = null;
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [isDraggingImage, onUpdateTransform, wallId]);

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (!imageState) return;
        event.preventDefault();
        if (event.shiftKey) {
            const nextRotation = imageState.transform.rotation + event.deltaY * 0.2;
            onUpdateTransform(wallId, { rotation: nextRotation });
        } else {
            const deltaScale = event.deltaY * -0.001;
            const nextScale = clamp(imageState.transform.scale + deltaScale, 0.2, 5);
            onUpdateTransform(wallId, { scale: nextScale });
        }
    };

    return (
        <div
            className="relative rounded-lg border border-white/15 overflow-hidden bg-neutral-900/70 backdrop-blur-[1px]"
            style={{ width, height }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
            />

            <div
                role="button"
                tabIndex={0}
                onClick={(event) => {
                    if (isDraggingImage || imageState) {
                        event.preventDefault();
                        return;
                    }
                    inputRef.current?.click();
                }}
                onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && !imageState) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsHoveringDrop(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsHoveringDrop(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsHoveringDrop(false);
                    handleFiles(event.dataTransfer.files);
                }}
                onMouseDown={beginDrag}
                onWheel={handleWheel}
                className="absolute inset-0 cursor-pointer"
                style={{ touchAction: "none" }}
            >
                {imageState ? (
                    <>
                        <img
                            src={imageState.src}
                            alt="Uploaded visual"
                            className="absolute"
                            style={{
                                top: "50%",
                                left: "50%",
                                width: naturalSize?.width ?? width,
                                height: naturalSize?.height ?? height,
                                transform: `translate(-50%, -50%) translate(${imageState.transform.x}px, ${imageState.transform.y}px) scale(${baseScale * imageState.transform.scale}) rotate(${imageState.transform.rotation}deg)`,
                                transformOrigin: "center",
                                maxWidth: "none",
                                maxHeight: "none",
                                willChange: "transform",
                                pointerEvents: "none",
                            }}
                            onLoad={(event) => {
                                const { naturalWidth, naturalHeight } = event.currentTarget;
                                setNaturalSize({ width: naturalWidth, height: naturalHeight });
                            }}
                        />
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onClearImage(wallId);
                            }}
                            className="absolute top-3 left-3 px-2 py-1 text-[11px] uppercase tracking-[0.15em] bg-white/90 text-black rounded-sm hover:bg-white"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onResetTransform(wallId);
                            }}
                            className="absolute top-3 right-3 px-2 py-1 text-[11px] uppercase tracking-[0.15em] bg-white/90 text-black rounded-sm hover:bg-white"
                        >
                            Reset
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                        Click or drop image
                    </div>
                )}

                {isHoveringDrop && (
                    <div className="absolute inset-0 border-2 border-dashed border-white/40 bg-white/5 pointer-events-none" />
                )}
            </div>
        </div>
    );
}

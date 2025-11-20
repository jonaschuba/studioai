"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type WallId = "W1" | "W2" | "W3" | "W4" | "W5";

export type WallTransform = {
    x: number;
    y: number;
    scale: number;
    rotation: number;
};

export type WallImageState = {
    [wallId in WallId]?: {
        src: string;
        transform: WallTransform;
    };
};

interface WallImageContextValue {
    images: WallImageState;
    setImage: (wallId: WallId, src: string) => void;
    updateTransform: (wallId: WallId, partial: Partial<WallTransform>) => void;
    resetTransform: (wallId: WallId) => void;
    clearImage: (wallId: WallId) => void;
}

const DEFAULT_TRANSFORM: WallTransform = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
};

const WallImageContext = createContext<WallImageContextValue | null>(null);

const STORAGE_KEY = "studio3_wall_state";
const isValidSrc = (src: unknown) => typeof src === "string" && src.length > 0;

type PersistedEntry = { src?: unknown; transform?: Partial<WallTransform> };

const sanitizeState = (state: unknown): WallImageState => {
    if (!state || typeof state !== "object") return {};
    const next: WallImageState = {};
    const record = state as Partial<Record<WallId, PersistedEntry>>;

    (["W1", "W2", "W3", "W4", "W5"] as WallId[]).forEach((id) => {
        const entry = record[id];
        if (entry && typeof entry === "object" && isValidSrc(entry.src)) {
            next[id] = {
                src: entry.src as string,
                transform: {
                    x: Number(entry.transform?.x ?? 0) || 0,
                    y: Number(entry.transform?.y ?? 0) || 0,
                    scale:
                        typeof entry.transform?.scale === "number" && entry.transform.scale > 0
                            ? entry.transform.scale
                            : 1,
                    rotation:
                        typeof entry.transform?.rotation === "number"
                            ? entry.transform.rotation
                            : 0,
                },
            };
        }
    });
    return next;
};

export function WallImageProvider({ children }: { children: React.ReactNode }) {
    const [images, setImages] = useState<WallImageState>({});
    const objectUrlsRef = useRef<Set<string>>(new Set());
    const hasHydratedRef = useRef(false);

    const trackObjectUrl = useCallback((url: string) => {
        if (url.startsWith("blob:")) {
            objectUrlsRef.current.add(url);
        }
    }, []);

    const revokeObjectUrl = useCallback((url?: string) => {
        if (url && objectUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            objectUrlsRef.current.delete(url);
        }
    }, []);

    const setImage = useCallback(
        (wallId: WallId, src: string) => {
            setImages((prev) => {
                const next = { ...prev };
                const existing = next[wallId];
                revokeObjectUrl(existing?.src);
                next[wallId] = { src, transform: { ...DEFAULT_TRANSFORM } };
                trackObjectUrl(src);
                return next;
            });
        },
        [revokeObjectUrl, trackObjectUrl]
    );

    const updateTransform = useCallback((wallId: WallId, partial: Partial<WallTransform>) => {
        setImages((prev) => {
            const existing = prev[wallId];
            if (!existing) return prev;
            return {
                ...prev,
                [wallId]: {
                    ...existing,
                    transform: {
                        ...existing.transform,
                        ...partial,
                    },
                },
            };
        });
    }, []);

    const resetTransform = useCallback((wallId: WallId) => {
        setImages((prev) => {
            const existing = prev[wallId];
            if (!existing) return prev;
            return {
                ...prev,
                [wallId]: {
                    ...existing,
                    transform: { ...DEFAULT_TRANSFORM },
                },
            };
        });
    }, []);

    const clearImage = useCallback(
        (wallId: WallId) => {
            setImages((prev) => {
                const next = { ...prev };
                const existing = next[wallId];
                if (!existing) return prev;
                revokeObjectUrl(existing.src);
                delete next[wallId];
                return next;
            });
        },
        [revokeObjectUrl]
    );

    useEffect(() => {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as WallImageState;
                const cleaned = sanitizeState(parsed);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setImages(cleaned);
            } catch {
                // ignore invalid storage
            }
        }
        hasHydratedRef.current = true;
    }, []);

    useEffect(() => {
        if (!hasHydratedRef.current) return;
        try {
            const cleaned = sanitizeState(images);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch {
            // storage write can fail; ignore
        }
    }, [images]);

    useEffect(() => {
        const urls = objectUrlsRef.current;
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);

    const value = useMemo(
        () => ({ images, setImage, updateTransform, resetTransform, clearImage }),
        [images, setImage, updateTransform, resetTransform, clearImage]
    );

    return <WallImageContext.Provider value={value}>{children}</WallImageContext.Provider>;
}

export function useWallImages() {
    const context = useContext(WallImageContext);
    if (!context) {
        throw new Error("useWallImages must be used within a WallImageProvider");
    }
    return context;
}

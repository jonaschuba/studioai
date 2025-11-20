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
        refWidth?: number;
        refHeight?: number;
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

const sanitizeImages = (state: unknown): WallImageState => {
    if (!state || typeof state !== "object") return {};
    const next: WallImageState = {};
    const record = state as Partial<Record<WallId, PersistedEntry>>;

    (["W1", "W2", "W3", "W4", "W5"] as WallId[]).forEach((id) => {
        const entry = record[id];
        if (entry && typeof entry === "object" && isValidSrc(entry.src)) {
            const candidate = entry as { src?: unknown; refWidth?: unknown; refHeight?: unknown; transform?: Partial<WallTransform> };
            next[id] = {
                src: candidate.src as string,
                refWidth:
                    typeof candidate.refWidth === "number" && candidate.refWidth > 0
                        ? candidate.refWidth
                        : typeof entry.transform?.refWidth === "number" && entry.transform.refWidth > 0
                          ? entry.transform.refWidth
                          : undefined,
                refHeight:
                    typeof candidate.refHeight === "number" && candidate.refHeight > 0
                        ? candidate.refHeight
                        : typeof entry.transform?.refHeight === "number" && entry.transform.refHeight > 0
                          ? entry.transform.refHeight
                          : undefined,
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

const parseStored = (raw: string | null): { images: WallImageState; updatedAt: number } => {
    if (!raw) return { images: {}, updatedAt: 0 };
    try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object" && "images" in data) {
            const payload = data as { images?: unknown; updatedAt?: unknown };
            return {
                images: sanitizeImages(payload.images),
                updatedAt: typeof payload.updatedAt === "number" ? payload.updatedAt : 0,
            };
        }
        return { images: sanitizeImages(data), updatedAt: 0 };
    } catch {
        return { images: {}, updatedAt: 0 };
    }
};

const getInitialStored = () => {
    if (typeof window === "undefined") return { images: {}, updatedAt: 0 };
    return parseStored(window.localStorage.getItem(STORAGE_KEY));
};

export function WallImageProvider({ children }: { children: React.ReactNode }) {
    const initialStored = getInitialStored();
    const [images, setImages] = useState<WallImageState>(initialStored.images);
    const objectUrlsRef = useRef<Set<string>>(new Set());
    const hasHydratedRef = useRef(false);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const lastSyncedRef = useRef(initialStored.updatedAt);

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
        (wallId: WallId, src: string, panelSize?: { width: number; height: number }) => {
            setImages((prev) => {
                const next = { ...prev };
                const existing = next[wallId];
                revokeObjectUrl(existing?.src);
                next[wallId] = {
                    src,
                    transform: { ...DEFAULT_TRANSFORM },
                    refWidth: panelSize?.width ?? existing?.refWidth,
                    refHeight: panelSize?.height ?? existing?.refHeight,
                };
                trackObjectUrl(src);
                return next;
            });
        },
        [revokeObjectUrl, trackObjectUrl]
    );

    const updateTransform = useCallback(
        (
            wallId: WallId,
            partial: Partial<WallTransform>,
            panelSize?: { width: number; height: number }
        ) => {
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
                        refWidth: panelSize?.width ?? existing.refWidth,
                        refHeight: panelSize?.height ?? existing.refHeight,
                    },
                };
            });
        },
        []
    );

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
        hasHydratedRef.current = true;

        if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel(STORAGE_KEY);
            channelRef.current = channel;
            channel.onmessage = (event) => {
                const parsed =
                    typeof event.data === "string"
                        ? parseStored(event.data)
                        : parseStored(event.data?.raw ?? JSON.stringify(event.data ?? null));
                if (parsed.updatedAt > lastSyncedRef.current) {
                    setImages(parsed.images);
                    lastSyncedRef.current = parsed.updatedAt;
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                }
            };
        }

        const onStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY || !event.newValue) return;
            const parsed = parseStored(event.newValue);
            if (parsed.updatedAt > lastSyncedRef.current) {
                setImages(parsed.images);
                lastSyncedRef.current = parsed.updatedAt;
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("storage", onStorage);
            if (channelRef.current) {
                channelRef.current.close();
                channelRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!hasHydratedRef.current) return;
        try {
            const cleaned = sanitizeImages(images);
            const payload = { images: cleaned, updatedAt: Date.now() };
            lastSyncedRef.current = payload.updatedAt;
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            if (channelRef.current) {
                channelRef.current.postMessage({ raw: JSON.stringify(payload) });
            }
            fetch("/api/wall-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch(() => {
                // ignore network failure
            });
        } catch {
            // storage write can fail; ignore
        }
    }, [images]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/wall-state", { cache: "no-store" });
                if (!res.ok) return;
                const data = (await res.json()) as { images?: unknown; updatedAt?: number };
                if (typeof data.updatedAt === "number" && data.updatedAt > lastSyncedRef.current) {
                    const cleaned = sanitizeImages(data.images);
                    setImages(cleaned);
                    lastSyncedRef.current = data.updatedAt;
                    window.localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify({ images: cleaned, updatedAt: data.updatedAt })
                    );
                }
            } catch {
                // ignore network/poll failure
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

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

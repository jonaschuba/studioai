import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { WallImageState } from "@/components/design/WallImageContext";

type NetworkState = {
    images: WallImageState;
    updatedAt: number;
};

const memoryFallback: NetworkState = { images: {}, updatedAt: 0 };
const KV_KEY = "studio3_wall_state";

const hasKv =
    typeof process.env.KV_REST_API_URL === "string" &&
    typeof process.env.KV_REST_API_TOKEN === "string";

async function readState(): Promise<NetworkState> {
    if (hasKv) {
        const state = await kv.get<NetworkState>(KV_KEY);
        if (state && typeof state === "object" && typeof state.updatedAt === "number") {
            return state;
        }
    }
    return memoryFallback;
}

async function writeState(next: NetworkState) {
    if (hasKv) {
        await kv.set(KV_KEY, next);
    } else {
        memoryFallback.images = next.images;
        memoryFallback.updatedAt = next.updatedAt;
    }
}

export async function GET() {
    const state = await readState();
    return NextResponse.json(state, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<NetworkState>;
        if (!body || typeof body !== "object" || typeof body.updatedAt !== "number" || !body.images) {
            return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
        }

        const current = await readState();
        if (body.updatedAt > current.updatedAt) {
            const next: NetworkState = {
                images: body.images as WallImageState,
                updatedAt: body.updatedAt,
            };
            await writeState(next);
            return NextResponse.json({ ok: true, applied: true });
        }
        return NextResponse.json({ ok: true, applied: false });
    } catch {
        return NextResponse.json({ ok: false, error: "parse error" }, { status: 400 });
    }
}

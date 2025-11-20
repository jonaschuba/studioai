import { NextResponse } from "next/server";
import type { WallImageState } from "@/components/design/WallImageContext";

type NetworkState = {
    images: WallImageState;
    updatedAt: number;
};

let memoryState: NetworkState = { images: {}, updatedAt: 0 };

export async function GET() {
    return NextResponse.json(memoryState, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<NetworkState>;
        if (body && typeof body === "object" && typeof body.updatedAt === "number" && body.images) {
            if (body.updatedAt > memoryState.updatedAt) {
                memoryState = {
                    images: body.images as WallImageState,
                    updatedAt: body.updatedAt,
                };
            }
            return NextResponse.json({ ok: true, applied: body.updatedAt >= memoryState.updatedAt });
        }
        return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
    } catch {
        return NextResponse.json({ ok: false, error: "parse error" }, { status: 400 });
    }
}
